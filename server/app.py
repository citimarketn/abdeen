# -*- coding: utf-8 -*-
"""
خادم الطلبات لمتجر عابدين (Flask + Firebase Admin).

المبدأ الأمني (Security principle): المتصفح يرسل فقط معرّف المنتج + الكمية + اللون/المقاس + بيانات التوصيل.
الأسعار والشحن والمخزون والتحقق من الخيارات (اللون/المقاس) كلها تُقرأ وتُتحقق من Firestore داخل
معاملة واحدة (Transaction)، فلا يمكن التلاعب بالسعر ولا بيع كمية أكبر من المخزون.
"""
import os, re, json, time, secrets, threading
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore, auth

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024  # 32KB كحد أقصى للطلب

_raw = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
firebase_admin.initialize_app(
    credentials.Certificate(json.loads(_raw)) if _raw else credentials.ApplicationDefault()
)
db = firestore.client()

ALLOWED = [o.strip().rstrip("/") for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
PHONE = re.compile(r"^01[0125]\d{8}$")
MAX_LINES, MAX_QTY, MAX_TOTAL = 50, 20, 1_000_000


class Bad(Exception):
    def __init__(self, msg, code=400):
        super().__init__(msg)
        self.msg, self.code = msg, code


def clean(v, mx):
    return re.sub(r"\s+", " ", str(v if v is not None else "")).strip()[:mx]


# ---------- تحديد المعدل (لكل مستخدم، داخل العملية) ----------
_hits, _lock = {}, threading.Lock()


def limited(uid, limit=5, window=600):
    now = time.time()
    with _lock:
        q = [t for t in _hits.get(uid, []) if now - t < window]
        if len(q) >= limit:
            _hits[uid] = q
            return True
        q.append(now)
        _hits[uid] = q
        return False


# ---------- بناء الطلب (دوال نقية قابلة للاختبار) ----------
def parse_items(raw):
    """يدمج الأسطر المتطابقة (منتج + لون + مقاس) ويتحقق من الشكل فقط."""
    if not isinstance(raw, list) or not raw:
        raise Bad("السلة فارغة.")
    merged = {}
    for it in raw:
        if not isinstance(it, dict):
            raise Bad("بيانات السلة غير صحيحة.")
        pid, q = it.get("id"), it.get("q")
        if not isinstance(pid, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,40}", pid):
            raise Bad("منتج غير صحيح في السلة.")
        if isinstance(q, bool) or not isinstance(q, int) or not (1 <= q <= MAX_QTY):
            raise Bad("الكمية غير صحيحة.")
        key = (pid, clean(it.get("color"), 40), clean(it.get("size"), 40))
        merged[key] = merged.get(key, 0) + q
        if merged[key] > MAX_QTY:
            raise Bad("الحد الأقصى للكمية %d لكل منتج." % MAX_QTY)
    if len(merged) > MAX_LINES:
        raise Bad("عدد المنتجات في الطلب كبير.")
    return [{"pid": k[0], "color": k[1], "size": k[2], "q": q} for k, q in merged.items()]


def _num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def build_order(uid, data, items, products, shipping):
    """products: {id: dict} من قاعدة البيانات فقط. يعيد (order, need) حيث need = الكميات المطلوب خصمها من المخزون."""
    if not isinstance(data, dict):
        raise Bad("طلب غير صحيح.")
    name, city = clean(data.get("name"), 80), clean(data.get("city"), 60)
    address, notes = clean(data.get("address"), 200), clean(data.get("notes"), 400)
    phone = re.sub(r"\D", "", str(data.get("phone") or ""))
    pay = "cod" if data.get("pay") == "cod" else "vodafone"
    if len(name) < 3:
        raise Bad("أدخل اسمك بالكامل.")
    if not PHONE.match(phone):
        raise Bad("أدخل رقم موبايل مصري صحيحًا.")
    if len(city) < 2 or len(address) < 5:
        raise Bad("أدخل المدينة والعنوان بالتفصيل.")

    lines, total, need = [], 0, {}
    for it in items:
        pid, q = it["pid"], it["q"]
        p = products.get(pid)
        if not p:
            raise Bad("أحد المنتجات لم يعد متاحًا، حدّث السلة.")
        pname = clean(p.get("name"), 120)
        price = p.get("price")
        if not _num(price) or price <= 0:
            raise Bad("تعذر تسعير أحد المنتجات، تواصل مع المتجر.", 409)
        # التحقق من اللون والمقاس: يجب أن يكونا من الخيارات المعرّفة للمنتج فقط
        colors = [c.get("name") for c in (p.get("colors") or []) if isinstance(c, dict)]
        sizes = [x for x in (p.get("sizes") or []) if isinstance(x, str)]
        if colors:
            if it["color"] not in colors:
                raise Bad("اختر لونًا صحيحًا للمنتج «%s»." % pname)
        elif it["color"]:
            raise Bad("هذا المنتج بلا ألوان.")
        if sizes:
            if it["size"] not in sizes:
                raise Bad("اختر مقاسًا صحيحًا للمنتج «%s»." % pname)
        elif it["size"]:
            raise Bad("هذا المنتج بلا مقاسات.")
        src = "drop" if p.get("src") == "drop" else "own"
        stock = p.get("stock")
        if src == "own" and _num(stock):
            need[pid] = need.get(pid, 0) + q
        lines.append({
            "id": pid, "name": pname, "price": price, "q": q, "src": src,
            "lead": clean(p.get("lead"), 20), "unit": p.get("unit") if p.get("unit") in ("kg", "m") else "piece",
            "color": it["color"], "size": it["size"],
        })
        total += price * q
    for pid, qty in need.items():
        have = products[pid].get("stock")
        if have < qty:
            raise Bad("المتاح من «%s» %d فقط." % (clean(products[pid].get("name"), 120), max(0, int(have))))

    ship = shipping if _num(shipping) and shipping > 0 else 0
    if total + ship > MAX_TOTAL:
        raise Bad("قيمة الطلب كبيرة، تواصل مع المتجر.")
    now = time.gmtime()
    oid = "AB-%02d%02d%02d-%s" % (now.tm_year % 100, now.tm_mon, now.tm_mday,
                                  "".join(secrets.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(5)))
    order = {
        "id": oid, "uid": uid, "name": name, "phone": phone, "city": city, "address": address,
        "notes": notes, "pay": pay, "items": lines, "shipping": ship,
        "total": total + ship, "status": "new", "ts": int(time.time() * 1000),
    }
    return order, need


def place_order(uid, data):
    items = parse_items(data.get("items") if isinstance(data, dict) else None)
    refs = {p: db.collection("products").document(p) for p in sorted({i["pid"] for i in items})}
    settings_ref = db.document("settings/store")

    @firestore.transactional
    def body(txn):
        snaps = db.get_all(list(refs.values()), transaction=txn)
        products = {s.id: s.to_dict() for s in snaps if s.exists}
        st = settings_ref.get(transaction=txn)
        shipping = (st.to_dict() or {}).get("shipping", 0) if st.exists else 0
        order, need = build_order(uid, data, items, products, shipping)
        for pid, qty in need.items():  # خصم المخزون ذريًا (كل القراءات قبل الكتابات)
            txn.update(refs[pid], {"stock": products[pid]["stock"] - qty})
        txn.create(db.collection("orders").document(order["id"]), order)
        return order

    return body(db.transaction())


# ---------- المسارات ----------
@app.after_request
def headers(resp):
    origin = request.headers.get("Origin", "").rstrip("/")
    if origin and origin in ALLOWED:
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        resp.headers["Access-Control-Max-Age"] = "600"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    resp.headers["Cache-Control"] = "no-store"
    return resp


@app.route("/health")
def health():
    return jsonify(ok=True)


@app.route("/api/orders", methods=["POST", "OPTIONS"])
def create_order():
    if request.method == "OPTIONS":
        return "", 204
    try:
        h = request.headers.get("Authorization", "")
        if not h.startswith("Bearer "):
            raise Bad("سجّل الدخول أولًا.", 401)
        try:
            uid = auth.verify_id_token(h[7:])["uid"]
        except Exception:
            raise Bad("انتهت الجلسة، سجّل الدخول من جديد.", 401)
        if limited(uid):
            raise Bad("محاولات كثيرة، انتظر بضع دقائق ثم أعد المحاولة.", 429)
        order = place_order(uid, request.get_json(silent=True))
        return jsonify(order=order), 201
    except Bad as e:
        return jsonify(error=e.msg), e.code
    except Exception:
        app.logger.exception("order failed")
        return jsonify(error="حدث خطأ في الخادم، حاول مرة أخرى."), 500


if __name__ == "__main__":
    app.run(port=int(os.environ.get("PORT", 5000)))
