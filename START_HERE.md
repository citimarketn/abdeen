# ابدأ من هنا (Start here)

## ✨ جديد في هذا التحديث
- **أيقونة المتجر الجديدة** (عربة عابدين) مدمجة داخل `index.html` نفسه، فتظهر في الهيدر وفي تبويب المتصفح حتى لو لم تُرفع الصور. ملفات `images/` المرفقة (`logo.png` و`apple-touch-icon.png`…) انسخها إلى مجلد `images` عندك لأيقونة الشاشة الرئيسية في الجوال.
- **وضوح الخيارات للعميل:** بطاقات الأقسام والمنتجات تعرض شارات (Badges): ⚖️ بالكيلو، 📏 بالمتر، 🎨 ألوان، 📐 مقاسات؛ وصفحة المنتج تكتب «(مطلوب)» بجانب اللون والمقاس.
- **أنصاف الكيلو والمتر:** منتجات الكيلو/المتر تُطلب بخطوة 0.5 (حتى 50)، والقطع بأعداد صحيحة (حتى 20).

> ⚠️ **ارفع `app.py` الجديد على PythonAnywhere (ثم Reload) قبل رفع `index.html`**، لأن النسخة القديمة من الخادم ترفض الكميات الكسرية.

**ملاحظة الأيقونة:** المتصفح يحتفظ بالأيقونة القديمة (Favicon) مدة طويلة؛ بعد الرفع اضغط Ctrl+F5، وإن بقيت القديمة في صفحة «علامة تبويب جديدة» فاحذف الاختصار وأضفه من جديد. وإن كان في لوحة التحكم ← بيانات المتجر حقل «أيقونة المتجر» مكتوب فيه مسار، فأفرغه ليُستخدم الشعار المدمج.

## 🔴 الخطوة 0 — طارئة: مفتاح الخادم تسرّب (Service Account key leaked)
ملفات الاستضافة (Hosting) التي نشرتها `firebase deploy` تحتوي على `key.json.json` وعلى مجلد `.git` كاملًا،
أي أن المفتاح كان متاحًا للعامة على رابط الاستضافة. وهو الآن موجود أيضًا في المحادثة. **اعتبره مخترَقًا:**

1. **ألغِ المفتاح:** Google Cloud Console ← IAM & Admin ← Service Accounts ← `firebase-adminsdk-fbsvc@wadi-decor-ce971…` ← Keys (المفاتيح) ← احذف المفتاح الذي يبدأ معرّفه بـ `a58a2e27`.
2. **أوقف الاستضافة:** Firebase Console ← Hosting، في المشروعين `wadi-decor` و`wadi-decor-ce971` (إن وُجد فيهما موقع) ← قائمة ⋮ ← Disable site (تعطيل الموقع). موقعك الحقيقي على GitHub Pages ولا تحتاج استضافة Firebase.
3. **افحص أي عبث:** Firestore ← مجموعة `admins`: يجب ألا يوجد فيها غير حساباتك. وAuthentication ← Users: لا تُبقِ حسابات لا تعرفها. وتأكد أن مجموعتي `products` و`orders` لم تُعدَّل بما لا تعرفه.
4. **مفتاح جديد:** Firebase Console ← Project settings ← Service accounts ← Generate new private key. ارفعه إلى PythonAnywhere فقط (انظر أدناه)، ولا تضعه في أي مجلد مشروع ولا ترسله لأحد.
5. **تحقق أن المفتاح لم يدخل GitHub:** في مجلد المشروع نفّذ `git log --all --oneline -- "*key*.json*"` فإن لم يطبع شيئًا فهو سليم.

## 🧹 تنظيف مجلد المشروع (Cleanup)
احذف من مجلد `Abdeen` على جهازك: `key.json.json` (أو `key.json`)، `base.html`، `build.py`، `catalog.py`، `hosting*.cache`، `.firebase/`، `firebase.json` القديم، `firestore.rules`، `app.py`، `requirements.txt`، `_headers`.
**يبقى فقط:** `index.html` و`images/` و`README.md` و`.gitignore` و`.git`.

## 1) GitHub (الموقع)
انسخ محتويات مجلد `github/` فوق مجلد المشروع (استبدل `index.html` و`.gitignore` و`README.md`)، ثم:
```
git add -A
git status          # تأكد أن لا يظهر أي ملف مفتاح
git commit -m "update store"
git push
```
انتظر دقيقة ثم Ctrl+F5.

## 2) Firebase Console (القواعد Rules)
- **بالنسخ:** Firestore Database ← Rules ← الصق محتوى `firebase/firestore.rules` ← Publish (نشر).
- **أو بالأمر:** داخل مجلد `firebase/` نفّذ `firebase deploy --only firestore:rules` (الملف الجديد `firebase.json` ينشر القواعد فقط ولا ينشر أي موقع).

## 3) PythonAnywhere (الخادم)
1. من تبويب Files ارفع `app.py` و`requirements.txt` إلى مجلد الخادم، وارفع **المفتاح الجديد** إلى `/home/mazhar/secrets/firebase-key.json`، ثم في Bash: `chmod 600 /home/mazhar/secrets/firebase-key.json`.
2. **احذف المفتاح القديم** من PythonAnywhere.
3. في Bash: `pip install --user -r requirements.txt` (أو حدّث الـ virtualenv).
4. ضع محتوى `wsgi_template.py` في ملف WSGI (تبويب Web) بعد تعديل المسارات، ثم اضغط **Reload**.
5. افتح `https://mazhar.pythonanywhere.com/health` فيجب أن ترى `{"ok":true}`.

## 4) بعد الرفع
- أضف الصور الحقيقية للمنتجات من لوحة التحكم (حتى 4 لكل منتج).
- افتح F12 ← Console وتأكد من عدم وجود أخطاء CSP أو `permission-denied`.
- جرّب طلبًا كاملًا، وتأكد أنه ظهر في لوحة التحكم ← الطلبات.
