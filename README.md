# متجر عابدين (Abdeen Store)

```
wadi-decor/
├─ site/        index.html + _headers   ← الموقع (يُرفع على GitHub Pages / Netlify)
├─ server/      app.py + requirements.txt ← خادم الطلبات (PythonAnywhere / Render)
├─ firebase/    firestore.rules          ← قواعد الحماية (تُلصق في Firebase)
└─ images/      (مجلدك أنت) logo.png, hero-banner.jpg, hero-background.jpg, shop-header-bg.jpg, cart-bg.jpg, design-credit.png
```

## ترتيب التحديث (Update order)
1. **Firebase ← Firestore ← Rules (القواعد):** الصق `firebase/firestore.rules` واضغط Publish (نشر). مهم: يضيف حماية بيانات الموردين وقيودًا على السلة.
2. **الخادم (Server):** استبدل `app.py` على PythonAnywhere ثم اضغط Reload (إعادة تحميل). النسخة الجديدة تتحقق من اللون والمقاس وتخصم المخزون ذريًا (Atomic).
3. **الموقع (Site):** ارفع `index.html` (و`_headers` إن كنت على Netlify) إلى GitHub:
   `git add index.html && git commit -m "update" && git push`
4. اضغط Ctrl+F5 في المتصفح.

## البيانات الموجودة (Existing data)
- التعبئة الافتراضية (Seed) تعمل مرة واحدة فقط. للبدء بالكتالوج الجديد: احذف من Firestore مجموعات `products` و`categories` ومستندي `settings/store` و`settings/pages`، ثم من لوحة التحكم اضغط **تحميل المنتجات والأقسام الافتراضية**.
- إن أبقيت بياناتك الحالية: افتح كل منتج دروبشيبنج واضغط **حفظ** مرة واحدة، فتنتقل بيانات المورّد إلى مجموعة `productPrivate` السرية ويُمسح الحقل العام القديم.
- صور المنتجات الافتراضية غير موجودة (يظهر مكانها رمز محايد)؛ ارفع صورك الحقيقية من تعديل المنتج (حتى 4 صور).

## ملاحظات أمنية (Security notes)
- الأسعار والمخزون والخيارات تُتحقق من الخادم فقط؛ لا يُثق بأي رقم قادم من المتصفح.
- سياسة الأمان (CSP) تسمح بسكربت مضمّن (Inline) لأن الموقع ملف واحد؛ للأمان الأعلى مستقبلًا افصل الكود في ملف `app.js` واستخدم Hash/Nonce.
- تحديد المعدل (Rate limit) داخل ذاكرة العملية فقط ويُصفَّر عند إعادة التشغيل.
- فعّل التحقق بخطوتين (2-Step Verification) لحساب المسؤول، ولا ترفع ملف مفتاح الخادم إلى GitHub أبدًا.
