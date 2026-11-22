"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

const dict: Dict = {
  // ===== Header / nav =====
  allProducts: { ar: "كل المنتجات", en: "All Products" },
  deals: { ar: "العروض والخصومات", en: "Deals & Offers" },
  searchPh: { ar: "ابحث عن منتج أو قسم… (عباية، عطر، ساعة ذكية)", en: "Search products or categories…" },
  searchPhShort: { ar: "ابحث عن منتج أو قسم…", en: "Search products…" },
  cart: { ar: "سلة التسوق", en: "Shopping cart" },
  account: { ar: "حسابي", en: "My account" },
  admin: { ar: "لوحة التحكم", en: "Admin panel" },
  // ===== Auth modal =====
  login: { ar: "تسجيل الدخول", en: "Sign in" },
  register: { ar: "إنشاء حساب", en: "Create account" },
  fullName: { ar: "الاسم بالكامل", en: "Full name" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  phone: { ar: "رقم الموبايل", en: "Phone number" },
  password: { ar: "كلمة المرور", en: "Password" },
  haveAccount: { ar: "لديك حساب؟ سجّل دخولك", en: "Have an account? Sign in" },
  noAccount: { ar: "ما عندك حساب؟ أنشئ حساباً", en: "No account? Create one" },
  welcome: { ar: "أهلاً بعودتك", en: "Welcome back" },
  memberBenefit: {
    ar: "تابع طلباتك، وأكمل تسوقك أسرع ببياناتك محفوظة",
    en: "Track your orders and check out faster",
  },
  googleBtn: { ar: "المتابعة بحساب جوجل", en: "Continue with Google" },
  dataProtected: {
    ar: "بياناتك محمية. كلمة المرور تُخزَّن مشفرة ولا يراها أحد.",
    en: "Your data is protected. Passwords are encrypted and never shared.",
  },
  googleUnset: {
    ar: "فعّل Google Client ID من لوحة التحكم → الإعدادات → الأمان لتفعيل الدخول بجوجل",
    en: "Enable Google Client ID in Admin → Settings → Security",
  },
  // Product source
  srcOurs: { ar: "من مخزوننا — جاهز للشحن", en: "From our stock — ready to ship" },
  srcPartner: {
    ar: "يُشحن من مورد شريك موثوق — قد تأخذ أيامًا إضافية",
    en: "Ships from a trusted partner — may take a few extra days",
  },
  // ===== Account page =====
  myAccount: { ar: "حسابي", en: "My account" },
  profile: { ar: "ملفي الشخصي", en: "My profile" },
  myOrders: { ar: "طلباتي", en: "My orders" },
  city: { ar: "المحافظة", en: "Governorate" },
  address: { ar: "العنوان", en: "Address" },
  save: { ar: "حفظ التعديلات", en: "Save changes" },
  saved: { ar: "تم الحفظ", en: "Saved" },
  noOrders: { ar: "ما عندك طلبات بعد — أول طلب هتلاقيه هنا.", en: "No orders yet — your first order will appear here." },
  orderNo: { ar: "رقم الطلب", en: "Order no." },
  items: { ar: "قطعة", en: "items" },
  signOut: { ar: "تسجيل الخروج", en: "Sign out" },
  memberSince: { ar: "عميل منذ", en: "Member since" },
  // ===== Hero =====
  heroKickerEn: { ar: "وصلت تشكيلة 2026", en: "The 2026 collection has arrived" },
  heroTitleEn: { ar: "تسوّق وكأّنت على الأرض", en: "Shop as if you were on the ground" },
  heroSubEn: {
    ar: "مع عابدين، نختار لك قطعًا راقية وأصالة موثوقة في الأزياء والإلكترونيات والمنزل — تصلك حتى باب بيتك في أي مكان على مستوى الجمهورية.",
    en: "With Abdeen we curate premium, trusted pieces in fashion, electronics and home — delivered to your door anywhere in the country.",
  },
  ctaShop: { ar: "تسوّق الآن", en: "Shop now" },
  ctaDeals: { ar: "شاهد العروض", en: "See the deals" },
  audience: { ar: "تشكيلات مختارة للنساء · الرجال · الشباب (16 – 55 سنة)", en: "Curated for women · men · youth (16–55)" },
  statHappy: { ar: "عميل سعيد", en: "Happy customers" },
  statRating: { ar: "تقييم موثق", en: "Verified rating" },
  statGov: { ar: "محافظة نوصّلها", en: "Governorates covered" },
  freeShip: { ar: "توصيل مجاني", en: "Free shipping" },
  freeShipOver: { ar: "للطلبات فوق", en: "On orders over" },
  fastDelivery: { ar: "توصيل سريع", en: "Fast delivery" },
  in2to4: { ar: "من 2 إلى 4 أيام عمل", en: "In 2–4 business days" },
  ratingOf: { ar: "من 5 — +800 تقييم", en: "out of 5 — 800+ reviews" },
  limitedTime: { ar: "للفترة دي", en: "This week only" },
  // ===== Sections =====
  featured: { ar: "تشكيلات مميزة", en: "Featured collections" },
  pickFavor: { ar: "اختار من يعجبك", en: "Pick what you love" },
  viewAll: { ar: "عرض كل المنتجات", en: "View all products" },
  collectionChosen: { ar: "تشكيلة مختارة", en: "Curated collection" },
  colNewTitle: { ar: "وصل حديثًا", en: "Just arrived" },
  colNewDesc: { ar: "قطع جديدة وصلت للتو إلى رفوفنا", en: "Fresh pieces just landed on our shelves" },
  colDealsTitle: { ar: "عروض وخصومات", en: "Deals & discounts" },
  colDealsDesc: { ar: "خصومات حقيقية حتى 40% لفترة محدودة", en: "Real discounts up to 40% for a limited time" },
  colBestTitle: { ar: "الأكثر مبيعًا", en: "Best sellers" },
  colBestDesc: { ar: "القطع اللي عملاؤنا بيثقوا فيها", en: "The pieces our customers trust" },
  explore: { ar: "استكشف التشكيلة", en: "Explore collection" },
  dealsPeriod: { ar: "لفترة محدودة", en: "Limited time" },
  dealsTitle: { ar: "عروض وخصومات", en: "Deals & discounts" },
  viewAllDeals: { ar: "عرض كل العروض", en: "View all deals" },
  viewAllShort: { ar: "عرض الكل", en: "View all" },
  bestPick: { ar: "اختيار عملائنا", en: "Customer's picks" },
  bestTitle: { ar: "الأكثر مبيعًا", en: "Best sellers" },
  // ===== Values =====
  val1t: { ar: "توصيل لبابك", en: "Doorstep delivery" },
  val1d: { ar: "لجميع محافظات الجمهورية", en: "All governorates of Egypt" },
  val2t: { ar: "استرجاع 14 يوم", en: "14-day returns" },
  val2d: { ar: "بدون أسئلة، سياسة واضحة", en: "No questions, clear policy" },
  val3t: { ar: "دفع آمن", en: "Secure payment" },
  val3d: { ar: "عند الاستلام أو إلكتروني", en: "Cash on delivery or online" },
  val4t: { ar: "دعم على واتساب", en: "WhatsApp support" },
  val4d: { ar: "نرد عليك في دقائق", en: "We reply within minutes" },
  // ===== Testimonials =====
  tBadge: { ar: "آراء عملائنا", en: "Our reviews" },
  tTitle1: { ar: "ماذا يقول من", en: "What" },
  tTitle2: { ar: "تسوّقوا", en: "shoppers say" },
  tTitle3: { ar: "عندنا", en: "about us" },
  basedOn: { ar: "بناءً على +800 تقييم موثق", en: "Based on 800+ verified reviews" },
  // ===== Banner =====
  offerBadge: { ar: "عرض خاص", en: "Special offer" },
  // ===== FAQ =====
  faqBadge: { ar: "الأسئلة الشائعة", en: "FAQ" },
  faqTitle: { ar: "كل ما تريد معرفته", en: "Everything you need to know" },
  faq1q: { ar: "كيف أتابع طلبي بعد الطلب؟", en: "How do I track my order?" },
  faq1a: {
    ar: "فور تأكيد الطلب يصلك رقم متابعة فوري، ونتواصل معك عبر الهاتف وواتساب في كل مرحلة: قيد المراجعة، تم التجهيز، تم الشحن، وحتى الاستلام.",
    en: "As soon as your order is confirmed you get a tracking number, and we keep you updated by phone and WhatsApp at every stage: review, preparation, shipping, and delivery.",
  },
  faq2q: { ar: "هل المنتجات أصلية 100%؟", en: "Are the products 100% authentic?" },
  faq2a: {
    ar: "نعم، جميع منتجاتنا مستوردة وموزعة من مصادرها الموثوقة، وكل قطعة تمر بفحص جودة قبل الشحن. وأي منتج يختلف عن الوصف نستبدله فورًا.",
    en: "Yes — everything is sourced from trusted distributors and each piece passes a quality check before shipping. Anything that doesn't match its description is replaced immediately.",
  },
  faq3q: { ar: "ما هي سياسة الاسترجاع؟", en: "What is the return policy?" },
  faq3a: {
    ar: "تقدر ترجع أو تبدل أي قطعة خلال 14 يوم من الاستلام بحالتها الأصلية. نستلمها من باب بيتك ونرد المبلغ أو نستبدلها خلال 48 ساعة.",
    en: "Return or exchange any piece within 14 days of delivery in its original state. We pick it up from your door and refund or replace within 48 hours.",
  },
  faq4q: { ar: "ما طرق الدفع المتاحة؟", en: "What payment methods do you accept?" },
  faq4a: {
    ar: "الدفع عند الاستلام (كاش) متاح في كل المحافظات، بالإضافة إلى فودافون كاش وبطاقات الدفع الإلكتروني عند إتمام الطلب.",
    en: "Cash on delivery is available in every governorate, plus Vodafone Cash and cards at checkout.",
  },
  faq5q: { ar: "كم تستغرق مدة التوصيل؟", en: "How long does delivery take?" },
  faq5a: {
    ar: "القاهرة والجيزة خلال 24–48 ساعة، والجمهورية من 2 إلى 4 أيام عمل. التوصيل مجاني للطلبات فوق 1,000 ج.م.",
    en: "Cairo and Giza within 24–48 hours, the rest of the country in 2–4 business days. Free shipping over EGP 1,000.",
  },
  // ===== Shop =====
  home: { ar: "الرئيسية", en: "Home" },
  storeName: { ar: "متجر عابدين", en: "Abdeen Store" },
  resultsFor: { ar: "نتائج البحث عن «", en: "Results for \"" },
  allProductsT: { ar: "كل المنتجات", en: "All products" },
  productsCount: { ar: "منتج", en: "products" },
  sortBest: { ar: " — مرتب حسب مبيعات عملائنا", en: " — sorted by sales" },
  sortFresh: { ar: " — وصلوا للتو إلى الرفوف", en: " — just landed on the shelves" },
  sortSale: { ar: " — أسعار خاصة لفترة محدودة", en: " — special prices for a limited time" },
  filterTitle: { ar: "تصفية النتائج", en: "Filters" },
  filtersCount: { ar: "فلتر", en: "filters" },
  priceAny: { ar: "كل الأسعار", en: "All prices" },
  price1: { ar: "أقل من 400 ج.م", en: "Under EGP 400" },
  price2: { ar: "من 400 إلى 900 ج.م", en: "EGP 400 – 900" },
  price3: { ar: "من 900 إلى 1,500 ج.م", en: "EGP 900 – 1,500" },
  price4: { ar: "أكثر من 1,500 ج.م", en: "Over EGP 1,500" },
  ratingAny: { ar: "كل التقييمات", en: "All ratings" },
  rating4: { ar: "4 نجوم فأكثر", en: "4 stars & up" },
  rating3: { ar: "3 نجوم فأكثر", en: "3 stars & up" },
  sortNewest: { ar: "الأحدث أولًا", en: "Newest first" },
  sortSales: { ar: "الأكثر مبيعًا", en: "Best selling" },
  sortPriceAsc: { ar: "السعر: من الأقل للأعلى", en: "Price: low to high" },
  sortPriceDesc: { ar: "السعر: من الأعلى للأقل", en: "Price: high to low" },
  sortRating: { ar: "الأعلى تقييمًا", en: "Top rated" },
  onlyDeals: { ar: "عروض فقط", en: "Deals only" },
  onlyStock: { ar: "متوفر فقط", en: "In stock only" },
  clearFilters: { ar: "مسح الفلاتر", en: "Clear filters" },
  allCats: { ar: "كل الأقسام", en: "All categories" },
  noResults: { ar: "ما لقينا أي منتج يطابق بحثك", en: "No products match your search" },
  noResultsDesc: {
    ar: "جرب كلمة مختلفة أو امسح الفلاتر — التشكيلة كبيرة، ومفيش يوم بيقع على مثيل.",
    en: "Try a different word or clear the filters — the catalog is huge.",
  },
  // ===== Product =====
  category: { ar: "القسم", en: "Category" },
  reviews: { ar: "تقييم", en: "reviews" },
  of5: { ar: "من 5", en: "out of 5" },
  youSave: { ar: "وفّر", en: "You save" },
  sizeLabel: { ar: "المقاس", en: "Size" },
  colorLabel: { ar: "اللون", en: "Color" },
  itemTotal: { ar: "إجمالي القطعة", en: "Item total" },
  addToCart: { ar: "أضف إلى السلة", en: "Add to cart" },
  buyNow: { ar: "اشترِ الآن", en: "Buy now" },
  outOfStock: {
    ar: "نأسف، نفدت كمية هذا المنتج حاليًا — تابعنا قريبًا",
    en: "Sorry, this item is out of stock — check back soon",
  },
  lowStock: { ar: "باقي", en: "Only left:" },
  lowStockEnd: { ar: "قطع فقط — امسكها قبل ما تخلص", en: "pieces left — grab it before it's gone" },
  fastDel: { ar: "توصيل سريع", en: "Fast delivery" },
  ret14: { ar: "استرجاع 14 يوم", en: "14-day returns" },
  paySafe: { ar: "دفع آمن", en: "Secure payment" },
  sizesLabel: { ar: "المقاسات", en: "Sizes" },
  colorsLabel: { ar: "الألوان", en: "Colors" },
  statusLabel: { ar: "الحالة", en: "Availability" },
  inStockT: { ar: "متوفر", en: "In stock" },
  outStockT: { ar: "غير متوفر", en: "Out of stock" },
  deliveryEta: { ar: "التوصيل المتوقع", en: "Estimated delivery" },
  daysWord: { ar: "يوم", en: "days" },
  descTitle: { ar: "وصف المنتج", en: "Product description" },
  dPoint1: { ar: "فحص جودة لكل قطعة قبل الشحن", en: "Quality check on every piece" },
  dPoint2: { ar: "تغليف آمن يحافظ على القطعة", en: "Safe packaging" },
  dPoint3: { ar: "دعم ومتابعة بعد البيع", en: "After-sales support" },
  videoTitle: { ar: "فيديو المنتج", en: "Product video" },
  videoSub: { ar: "شاهد", en: "See" },
  videoEnd: { ar: "من قرب قبل ما تحجزه", en: "up close before you order" },
  reviewsTitle: { ar: "آراء العملاء", en: "Customer reviews" },
  avgRating: { ar: "متوسط التقييم", en: "Average rating" },
  verifiedBuy: { ar: "شراء موثق", en: "Verified purchase" },
  formTitle: { ar: "شاركنا تجربتك مع", en: "Share your experience with" },
  yourRating: { ar: "التقييم", en: "Your rating" },
  yourName: { ar: "اسمك", en: "Your name" },
  yourReview: { ar: "تقييمك", en: "Your review" },
  reviewPh: { ar: "اكتب رأيك في المنتج — الخامة، المقاس، سرعة التوصيل…", en: "Tell us about the product — fabric, fit, delivery speed…" },
  publish: { ar: "نشر التقييم", en: "Publish review" },
  publishing: { ar: "جارٍ الإرسال…", en: "Submitting…" },
  related: { ar: "قد يعجبك أيضًا", en: "You may also like" },
  quickAdd: { ar: "إضافة سريعة", en: "Quick add" },
  soldOut: { ar: "نفذت الكمية", en: "Sold out" },
  // ===== Cart drawer =====
  itemsWord: { ar: "قطعة", en: "items" },
  cartEmpty: { ar: "سلتك فارغة", en: "Your cart is empty" },
  cartEmptyDesc: {
    ar: "اكتشف تشكيلتنا المختارة وأضف ما يعجبك — التسوق عندنا سهل ومريح.",
    en: "Discover our curated collection and add what you like — shopping here is easy.",
  },
  browse: { ar: "تصفح المنتجات", en: "Browse products" },
  shipLocked: { ar: "مبروك! التوصيل مجاني لطلبك", en: "Congrats! Your shipping is free" },
  shipAdd: { ar: "أضف", en: "Add" },
  shipForFree: { ar: "لتحصل على توصيل مجاني", en: "to get free shipping" },
  shipFeeNote: {
    ar: "رسوم التوصيل تُحسب عند إتمام الطلب",
    en: "Shipping fee calculated at checkout",
  },
  subtotal: { ar: "الإجمالي الفرعي", en: "Subtotal" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  keepShopping: { ar: "مواصلة التسوق", en: "Keep shopping" },
  feeCalcNote: {
    ar: "تُحسب رسوم التوصيل عند إتمام الطلب — مجاني فوق",
    en: "Shipping calculated at checkout — free over",
  },
  feeFixedNote: {
    ar: "رسوم التوصيل تُحسب عند إتمام الطلب.",
    en: "Shipping fee calculated at checkout.",
  },
  addedToCart: { ar: "تمت الإضافة إلى السلة", en: "Added to cart" },
  // ===== Checkout =====
  checkoutTitle: { ar: "إتمام الطلب", en: "Checkout" },
  checkoutSub: {
    ar: "خطوة واحدة فقط وتفصلك عن طلبك — بيانات التوصيل هتستخدم مرة واحدة.",
    en: "One step left — delivery details are used once.",
  },
  deliveryInfo: { ar: "بيانات التوصيل", en: "Delivery details" },
  emailOpt: { ar: "الإيميل (اختياري)", en: "Email (optional)" },
  cityReq: { ar: "المحافظة", en: "Governorate" },
  addressReq: { ar: "العنوان بالتفصيل", en: "Full address" },
  addressPh: { ar: "اسم الشارع، رقم العمارة، الدور، أقرب علامة…", en: "Street, building, floor, nearest landmark…" },
  notesLabel: { ar: "ملاحظات للمندوب (اختياري)", en: "Notes for the courier (optional)" },
  notesPh: { ar: "مثال: اتصل بعد العصر", en: "e.g. Call after 4 PM" },
  payMethod: { ar: "طريقة الدفع", en: "Payment method" },
  cod: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  codDesc: { ar: "ادفع كاش للمندوب بعد ما تتأكد من طلبك", en: "Pay cash to the courier after checking your order" },
  cardPay: { ar: "بطاقة / محفظة إلكترونية", en: "Card / e-wallet" },
  cardDesc: { ar: "فودافون كاش أو فيزا — التحويل يتم عبر مندوبنا المؤمن", en: "Vodafone Cash or Visa — handled via our secure agent" },
  orderSummary: { ar: "ملخص الطلب", en: "Order summary" },
  shipping: { ar: "التوصيل", en: "Shipping" },
  free: { ar: "مجاني", en: "Free" },
  addForFree: { ar: "أضف", en: "Add" },
  toGetFree: { ar: "لتجيب توصيل مجاني", en: "for free shipping" },
  total: { ar: "الإجمالي", en: "Total" },
  confirmOrder: { ar: "تأكيد الطلب", en: "Place order" },
  confirming: { ar: "جارٍ تأكيد الطلب…", en: "Placing your order…" },
  missingInfo: {
    ar: "من فضلك أكمل الاسم وموبايلك والعنوان",
    en: "Please complete your name, phone and address",
  },
  secureNote: { ar: "بياناتك مشفرة ومحمية — مانتخزنش حاجة", en: "Your data is encrypted — nothing is stored" },
  preparing: { ar: "جارٍ تجهيز صفحة إتمام الطلب…", en: "Preparing checkout…" },
  // ===== Order page =====
  orderConfirmed: { ar: "طلبك اتأكد!", en: "Order confirmed!" },
  orderConfSub: {
    ar: "شكرًا لتسوقك من عابدين — هنبدأ نتواصل معك خلال ساعات لتأكيد الطلب.",
    en: "Thanks for shopping with Abdeen — we'll contact you within hours to confirm.",
  },
  orderCancelled: { ar: "تم إلغاء الطلب", en: "Order cancelled" },
  orderCancelledSub: {
    ar: "سيتواصل معك فريقنا لاسترجاع المبلغ.",
    en: "Our team will contact you about the refund.",
  },
  step1: { ar: "استلام الطلب", en: "Received" },
  step2: { ar: "قيد التجهيز", en: "Preparing" },
  step3: { ar: "تم الشحن", en: "Shipped" },
  step4: { ar: "تم الاستلام", en: "Delivered" },
  itemsOf: { ar: "محتويات الطلب", en: "Order items" },
  deliveryTo: { ar: "عنوان التوصيل", en: "Delivery address" },
  needHelp: { ar: "محتاج مساعدة؟", en: "Need help?" },
  helpText: {
    ar: "فريقنا على واتساب 24 ساعة — أي سؤال عن الطلب أو استبدال، ابعتلنا مباشرة.",
    en: "Our team is on WhatsApp 24/7 — any question about your order or a return, message us directly.",
  },
  waNow: { ar: "تواصل على واتساب", en: "Chat on WhatsApp" },
  backStore: { ar: "رجوع للمتجر", en: "Back to store" },
  createdAgo: { ar: "تم إنشاء الطلب", en: "Order created" },
  payCod: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  payCard: { ar: "بطاقة / محفظة إلكترونية", en: "Card / e-wallet" },
  payMethodW: { ar: "طريقة الدفع", en: "Payment" },
  // ===== Footer =====
  fCats: { ar: "أقسام المتجر", en: "Store categories" },
  fInfo: { ar: "معلومات", en: "Information" },
  fContact: { ar: "تواصل معنا", en: "Contact us" },
  termsUse: { ar: "شروط الاستخدام", en: "Terms of use" },
  privPolicy: { ar: "سياسة الخصوصية", en: "Privacy policy" },
  retPolicy: { ar: "سياسة الاسترجاع", en: "Return policy" },
  newArrivals: { ar: "وصل حديثًا", en: "New arrivals" },
  faqLink: { ar: "الأسئلة الشائعة", en: "FAQ" },
  allRights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  madeIn: { ar: "صُنع بـ ♥ في مصر", en: "Made with ♥ in Egypt" },
  // ===== 404 =====
  nfTitle: { ar: "الصفحة دي مش موجودة", en: "Page not found" },
  nfDesc: {
    ar: "ممكن الروابط اتغيرت أو الصفحة اتنقلت — لكن التشكيلة كلها هنا، ارجع للمتجر وكمل تسوقك.",
    en: "The link may have changed — but the whole collection is here. Head back to the store.",
  },
  goHome: { ar: "رجوع للرئيسية", en: "Back to home" },
  // ===== Assistant =====
  aiTitle: { ar: "مساعد عابدين الذكي", en: "Abdeen AI Assistant" },
  aiStatus: { ar: "قيد التجهيز — قريبًا", en: "In the works — coming soon" },
  aiMsg: {
    ar: "أهلًا! قريبًا هساعدك أختارلك الأنسب، أحدد المقاس، وأتابع طلبك خطوة بخطوة. ولحد كده، فريقنا على واتساب جاهز يرد عليك فورًا.",
    en: "Hi! Soon I'll help you pick the best fit, check sizes and track your order step by step. Until then, our team is on WhatsApp ready to reply instantly.",
  },
  waNowBtn: { ar: "تواصل الآن", en: "Contact now" },
};

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);
const LOCALE_KEY = "abdeen_locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LOCALE_KEY);
    } catch {
      /* ignore */
    }
    if (saved === "en" || saved === "ar") setLocaleState(saved);
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = locale === "ar" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);

  const t = useCallback(
    (key: string) => dict[key]?.[locale] ?? key,
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Server-safe translated text (renders via context). */
export function T({
  k,
  className,
  as: Tag = "span",
}: {
  k: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "button" | "label";
}) {
  const { t } = useI18n();
  return <Tag className={className}>{t(k)}</Tag>;
}
