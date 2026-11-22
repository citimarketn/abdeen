# دليل رفع متجر عابدين — خطوة بخطوة

## 0) الصورة الكاملة (ماذا يعمل وين)

| الأداة | دورها في مشروعك | ملاحظة |
|---|---|---|
| **جيت هب** | خازن الكود فقط (نسخة آمنة + تعاون) | لا ينفّذ التطبيق — GitHub Pages يخدم صفحات ثابتة فقط |
| **المتجر الفعلي** | **Google Cloud Run + Cloud SQL** (PostgreSQL) — أو Vercel كبديل أسهل | التطبيق Node.js ولا يعمل على Pages أو بايثون |
| **فايربيز** (مشروعك wadi-decor) | تفعيل **الدخول بجوجل** + (اختياريًا) Firestore للمزامنة المستقبلية | Hosting هناك ثابت فقط |
| **PythonAnywhere** (حسابك) | **خدمة البريد** برسائل الترحيب (ملف `python/abdeen_mail.py`) + وكيل الذكاء الاصطناعي `fb_ai_agent` الموجود عندك | ملفاتك الحالية تبقى مكانها، لا ترفع المتجر هناك |

---

## 1) ما يُرفع على جيت هب وما لا يُرفع

### ✅ ارفعه (كل كود المشروع)
```
src/                  ← كل الكود (صفحات، مكوّنات، API، قاعدة البيانات)
public/images/        ← الشعار والصور الثابتة
python/               ← خدمة البريد بايثون (توثيقها معك)
package.json
package-lock.json
next.config.ts
tsconfig.json
postcss.config.mjs
eslint.config.mjs
drizzle.config.json
Dockerfile            ← جاهز للرفع على Cloud Run
README.md
DEPLOY.md
.env.example          ← نموذج متغيرات البيئة (بدون أي قيم حقيقية)
.gitignore
```

### ❌ لا ترفعه أبدًا (مستبعدين تلقائيًا عبر .gitignore)
```
.env                  ← يحوي DATABASE_URL — سر!
node_modules/         ← يُعاد توليده بـ npm install
.next/                ← مخرجات البناء
public/uploads/       ← صورك المرفوعة (ضعها في تخزين سحابي: Cloud Storage/Firebase Storage)
```

### ⚠️ قواعد ذهبية قبل الـ push
1. تأكد أن `.env` غير موجود في الـ commit: `git status`
2. أي أكواد حماية/كلمات مرور في الكود → انقلها لمتغيرات بيئة (لدينا DATABASE_URL في .env فقط، وبقية الأسرار تُدار من لوحة التحكم داخل قاعدة البيانات)
3. استوديو جيت هب الحالي `citimarketn/abdeen` يحوي **النسخة القديمة الثابتة** (index.html) — أنشئ مستودعًا جديدًا باسم مثل `abdeen-store` ولا تخلط بينهما.

---

## 2) الرفع على جيت هب (من جهازك — 10 دقائق)

```bash
# داخل مجلد المشروع
git init
git add .
git commit -m "متجر عابدين — النسخة الكاملة"
git remote add origin https://github.com/abdeenali/abdeen-store.git
git branch -M main
git push -u origin main
```
(إنشا المستودع: GitHub → New repository → `abdeen-store` → Public/Private)

---

## 3) تشغيل المتجر الفعلي

### الخيار (أ) — Google Cloud Run + Cloud SQL (مطابق لمنصاتك)
```bash
# 1) أنشئ قاعدة بيانات PostgreSQL (Cloud SQL):
gcloud sql instances create abdeen-db \
  --region=me-central1 --database-version=POSTGRES_16 \
  --tier=db-g1-standard-1

# 2) أنشئ مستخدمًا وقاعدة:
gcloud sql users create abdeen --instance=abdeen-db --password="ضع-كلمة-قوية"
gcloud sql databases create abdeen_db --instance=abdeen-db

# 3) اربط شبكة (أو افتح الـ IP) واحصل على رابط الاتصال:
gcloud sql connections effective-ips list --instance=abdeen-db
# DATABASE_URL=postgresql://abdeen:كلمة-السر@العنوان:5432/abdeen_db

# 4) ابني الصورة وارفعها:
gcloud builds submit --region=me-central1
gcloud run deploy abdeen-store \
  --source=. --region=me-central1 \
  --set-env-vars DATABASE_URL="postgresql://..." \
  --add-iap-credentials (اختياري) \
  --allow-unauthenticated
```
بعد أول تشغيل: افتح `/admin` — البيانات التجريبية تُزرع تلقائيًا.

### الخيار (ب) — Vercel (الأسرع — 5 دقائق، مجاني)
1. Neon أو Supabase → أنشئ قاعدة Postgres → انسخ `DATABASE_URL`
2. Vercel → New Project → اختر مستودع `abdeen-store`
3. في Environment Variables ضع `DATABASE_URL`
4. Deploy — ولسه

> GitHub Pages (`citimarketn.github.io`) مناسب فقط لموقع ثابت — اترك النسخة القديمة هناك أو أرشيفها، والمتجر الحي على Cloud Run/Vercel.

---

## 4) فايربيز (مشروعك wadi-decor-ce971)

### ⚠️ أولًا — أمان (خطورة): قواعد Firestore عندك مفتوحة للعامة
في Firestore → Rules حاليًا `allow read, write: if true;` أي أن **أي شخص يستطيع حذف/تعديل بياناتك**. غيّر فورًا إلى:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
(ثم فعّل القراءة فقط للمجموعات التي يحتاجها تطبيقك مستقبلاً.)

### تفعيل الدخول بجوجل في المتجر
1. Google Cloud Console → **APIs & Services → Credentials**
2. Create Credentials → **OAuth client ID** → Web application
3. Authorized JavaScript origins: ضع دومين متجرك (مثال `https://abdeen-store-xxxx.a.run.app`)
4. انسخ **Client ID** (يبدأ برقم وينتهي بـ `.apps.googleusercontent.com`)
5. في متجرك: **لوحة التحكم ← الإعدادات ← الأمان ← Google Client ID** → حفظ
6. جرّب: أيقونة الحساب → «المتابعة بحساب جوجل» → سيختار حسابك `abdeenali@gmail.com`

> ملاحظة: الـ App ID الموجود في لوحة فايربيز (`1:918333881498:web:...`) هو إعداد تطبيق فايربيز — بينما المتجر يحتاج **OAuth Client ID** المنفصل من الخطوة 2.

### (اختياري) Firestore كنسخة مزامنة
نموذج بياناتنا (منتجات/طلبات/فريق) مطابق لمفهوم المجموعات في Firestore — لاحقًا يمكن لـ `fb_ai_agent` أو سكربت بايثون سحب البيانات منه (سنتوسع فيه عند طلبك).

---

## 5) PythonAnywhere (ملفاتك الحالية)

### ما يبقى مكانه
- `fb_ai_agent/` — وكيلك الحالي (لا تلمسه)
- `abdeen/app.py` — تطبيقاتك السابقة

### أضف خدمة البريد (رسائل الترحيب الفورية — مجاني عبر Gmail)
1. ارفع من مجلد المشروع: `python/abdeen_mail.py` + `python/requirements.txt`
   (Files → Upload → أو ضعها داخل دليل جديد `abdeen_mail/`)
2. Web → **Add a new web app** → Manual configuration → **Flask**
3. في WSGI configuration استبدل السطر الأخير بـ:
   ```python
   import abdeen_mail as app
   ```
4. فعّل تسجيل الدخول بخطوتين على حساب Gmail → أنشئ **كلمة مرور تطبيق**
5. في Web → WSGI → Environment variables أضف:
   - `GMAIL_USER` = إيميلك
   - `GMAIL_APP_PASS` = كلمة مرور التطبيق
   - `MAIL_SECRET` = أي كلمة سر طويلة
6. ارفع (Deploy web app)
7. في متجرك: **الإعدادات ← البريد ← المزود: PythonAnywhere** ←
   ضع `https://abdeenali.pythonanywhere.com/send` + نفس الـ `MAIL_SECRET`
8. اختبر: سجّل عضوًا جديدًا في المتجر → تصله رسالة الترحيب فورًا من Gmail ✓

### مهام مجدولة (مستقبلاً)
Tasks → كل يوم: سكربت بايثون يسحب الطلبات الجديدة ويحذفها في Firestore أو يرصد تنبيهات المخزون المنخفض.

---

## 6) قائمة الأمان النهائية قبل الإطلاق
- [ ] قواعد Firestore مغلقة (الخطوة 4-⚠️)
- [ ] `.env` غير مرفوع على جيت هب (`git log -- .env` فارغ)
- [ ] غيّرت أكواد الحماية الثلاثة وكلمة مرور المالك من الإعدادات
- [ ] Gmail App Password لا يتشاركها أحد (تعمل خلف `X-Abdeen-Key`)
- [ ] مستودع جيت هب: خاص (Private) حتى ترتاح — أو عام بعد التأكد أنه لا أسرار فيه

## 7) استكشاف سريع للأخطاء
| المشكلة | الحل |
|---|---|
| الموقع يقول Database error | `DATABASE_URL` غير مضبوط في Environment (Cloud Run/Vercel) أو قاعدة غير مبدَأة — شغّل مرة: `npx drizzle-kit push` محليًا على نفس القاعدة |
| زر جوجل لا يعمل | الـ Client ID مختلف عن الـ origin (بدّل البروتوكول/الـ subdomain) أو لم يُحفظ في الإعدادات |
| رسائل الترحيب في «الصندوق» ولا تُرسل | بايثون: تأكد أن الـ Web app يعمل (`/ping` يعيد ok) وأن المتغيرات الثلاثة مضبوطة، وأن رابط الـ send صحيح |
| الطلب لا يصل واتساب الفريق | لا أحد في الدوام: فعّل «موافقة على الدوام» من فريق العمل الميداني |
