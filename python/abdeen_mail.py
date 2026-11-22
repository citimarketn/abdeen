# -*- coding: utf-8 -*-
"""
متجر عابدين — خدمة البريد (تُرفع على PythonAnywhere)
-----------------------------------------------------
1) ارفع هذا الملف + requirements.txt إلى PythonAnywhere
2) في Web → Add a new web app → Manual configuration → Flask
3) في الـ WSGI config شغّل السطر:
     import abdeen_mail as app
   (اسم الملف بدون .py)
4) فعّل Gmail: حسابك على جوجل → الأمان → تسجيل الدخول بخطوتين →
   ثم: كلمات مرور التطبيق → أنشئ كلمة → ضعها في Environment
   (GMAIL_USER و GMAIL_APP_PASS) في Web → WSGI configuration
5) من لوحة المتجر: الإعدادات ← البريد ← المزود: PythonAnywhere
   وضع رابطك: https://abdeenali.pythonanywhere.com/send
   وسر مشاركة: أي كلمة طويلة (نفسها في Environment: MAIL_SECRET)

المتجر يرسل POST إلى /send بهذا الشكل:
   { "to": "user@mail.com", "subject": "...", "html": "<div>...</div>" }
ويعتمد التشفير على رأس X-Abdeen-Key.
"""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.headerregistry import Address

from flask import Flask, request, jsonify

app = Flask(__name__)

GMAIL_USER = os.environ.get("GMAIL_USER", "")
GMAIL_APP_PASS = os.environ.get("GMAIL_APP_PASS", "")
MAIL_SECRET = os.environ.get("MAIL_SECRET", "abdeen-mail-secret")
FROM_NAME = "عابدين"


@app.route("/send", methods=["POST"])
def send():
    if request.headers.get("X-Abdeen-Key") != MAIL_SECRET:
        return jsonify(ok=False, error="unauthorized"), 401
    d = request.get_json(silent=True) or {}
    to = (d.get("to") or "").strip()
    subject = d.get("subject") or "رسالة من عابدين"
    html = d.get("html") or ""
    if not to or "@" not in to:
        return jsonify(ok=False, error="invalid recipient"), 400
    if not GMAIL_USER or not GMAIL_APP_PASS:
        return jsonify(ok=False, error="Gmail not configured"), 500

    msg = MIMEMultipart("alternative")
    msg["From"] = Address(FROM_NAME, GMAIL_USER)
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as s:
            s.starttls()
            s.login(GMAIL_USER, GMAIL_APP_PASS)
            s.sendmail(GMAIL_USER, [to], msg.as_string())
    except Exception as e:  # noqa: BLE001
        return jsonify(ok=False, error=str(e)), 502
    return jsonify(ok=True, to=to)


@app.route("/ping", methods=["GET"])
def ping():
    return jsonify(ok=True, service="abdeen-mail")
