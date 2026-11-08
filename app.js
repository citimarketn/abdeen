// ملف التطبيق الوحيد: Firebase + الموقع العام (عربي/إنجليزي، ليلي/نهاري) + لوحة التحكم
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-check.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, doc, query, orderBy, limit, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

if (window.top !== window.self) { document.documentElement.style.display = "none"; try { window.top.location = window.self.location; } catch { /* محجوب */ } }

/* ============ 1) إعدادات Firebase ============ */
const firebaseConfig = {
  apiKey: "AIzaSyB3kxmllMDReCR6hVqbeKJ5IVb_pzLQUnc",
  authDomain: "national-foundation-6945d.firebaseapp.com",
  projectId: "national-foundation-6945d",
  storageBucket: "national-foundation-6945d.firebasestorage.app",
  messagingSenderId: "874449306313",
  appId: "1:874449306313:web:535a88c8ead683caad4318"
};
const RECAPTCHA_SITE_KEY = ""; // من Firebase Console > App Check
const app = initializeApp(firebaseConfig);
if (RECAPTCHA_SITE_KEY) initializeAppCheck(app, { provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
const db = getFirestore(app), auth = getAuth(app), storage = getStorage(app);

/* ============ 2) أدوات مشتركة ============ */
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls = "", text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const clean = (v, max = 300) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[<>]/g, "").trim().slice(0, max);
const isDataImg = (s) => /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(s || "");
const safeUrl = (u) => (/^https:\/\//i.test(u || "") || isDataImg(u) ? u : "");
const store = { get: (k) => { try { return Number(localStorage.getItem(k) || 0); } catch { return 0; } }, set: (k, v) => { try { localStorage.setItem(k, String(v)); } catch { /* ignore */ } } };
const readJson = (k, d = {}) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? d; } catch { return d; } };
const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };
const lines = (s) => String(s || "").split("\n").map((l) => l.trim()).filter(Boolean);
const ytId = (u) => (String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/) || [])[1];
const readDoc = async (id) => { try { const s = await getDoc(doc(db, "settings", id)); return s.exists() ? s.data() : null; } catch { return null; } };

async function toDataUrl(file, maxW, quality, maxLen = 700_000) { // ضغط الصورة وتحويلها لنص داخل قاعدة البيانات
  const bmp = await createImageBitmap(file); let w = Math.min(bmp.width, maxW), q = quality;
  for (let tries = 0; tries < 8; tries++) {
    const c = document.createElement("canvas"); c.width = Math.round(w); c.height = Math.round(bmp.height * (w / bmp.width));
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", q);
    if (url.length <= maxLen) return url;
    if (q > 0.5) q -= 0.1; else w *= 0.8;
  }
  throw new Error("الصورة كبيرة جدًا، اختر صورة أصغر أو استخدم الرفع من الجهاز.");
}

const googleSignIn = () => signInWithPopup(auth, new GoogleAuthProvider());
const AUTH_ERRORS = {
  "auth/unauthorized-domain": "النطاق غير مصرّح به: أضفه في Authentication ← Settings ← Authorized domains.",
  "auth/operation-not-allowed": "فعّل مزوّد Google من Authentication ← Sign-in method.",
  "auth/popup-blocked": "المتصفح منع النافذة المنبثقة، اسمح بها ثم أعد المحاولة.",
  "auth/popup-closed-by-user": "", "auth/cancelled-popup-request": ""
};
const authError = (err) => AUTH_ERRORS[err.code] ?? "تعذر تسجيل الدخول، حاول مرة أخرى.";

/* ============ 3) الألوان والوضعان (ليلي / نهاري) ============ */
const THEME_FIELDS = [["bg", "لون الخلفية الرئيسية"], ["bg2", "لون الأشرطة والخلفية الثانوية"], ["card", "لون البطاقات"], ["gold", "اللون المميز (الأزرار والخطوط)"], ["gold2", "اللون المميز الفاتح (العناوين)"], ["text", "لون النصوص"], ["onGold", "لون النص على الأزرار"]];
const THEME_VARS = { bg: "--bg", bg2: "--bg2", card: "--card", gold: "--gold", gold2: "--gold2", text: "--text", onGold: "--on-gold" };
const BASE = {
  dark: { bg: "#050d21", bg2: "#08142e", card: "#0b1a3b", gold: "#C9A227", gold2: "#E8C95A", text: "#e9edf7", onGold: "#0a1630" },
  light: { bg: "#f6f8fc", bg2: "#e9eff8", card: "#ffffff", gold: "#a67c00", gold2: "#8a6700", text: "#0f1b33", onGold: "#ffffff" }
};
function applyTheme(custom = {}) {
  const root = document.documentElement, mode = root.dataset.mode;
  Object.values(THEME_VARS).forEach((v) => root.style.removeProperty(v));
  const c = custom[mode] || (mode === "dark" && custom.bg ? custom : {});
  for (const [k, v] of Object.entries(THEME_VARS)) if (/^#[0-9a-f]{6}$/i.test(c[k] || "")) root.style.setProperty(v, c[k]);
}

/* ============ 4) المحتوى الافتراضي (عربي + إنجليزي) ============ */
const DEFAULTS = {
  topbar: "مؤسسة أهلية مشهرة برقم 810 لسنة 2024", topbar_en: "Civil society organization registered under No. 810 of 2024",
  heroTitle: "المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان", heroTitle_en: "Egyptian National Foundation for Development and Human Rights",
  heroAccent: "بمحافظة السويس", heroAccent_en: "in Suez Governorate",
  governorTitle: "السيد المحافظ", governorTitle_en: "The Governor", governorName: "اللواء / هاني رشاد", governorName_en: "Maj. Gen. Hani Rashad",
  chairmanName: "المستشار / صابر أبو دقة", chairmanName_en: "Counselor Saber Abu Dagga", chairmanTitle: "رئيس مجلس الأمناء", chairmanTitle_en: "Chairman of the Board of Trustees",
  slides: "نبني وطنًا يحمي حقوق أبنائه | مؤسسة مشهرة برقم 810 لسنة 2024 تعمل في السويس لخدمة المواطنين ودعم التنمية وحقوق الإنسان.\nاستشارة قانونية وتنموية لكل مواطن | قدّم استشارتك أو شكواك ويتابعها فريق المؤسسة.\nانضم إلينا متطوعًا أو عضوًا | مبادرات ميدانية في أحياء السويس تحتاج إلى سواعد أبنائها.",
  slides_en: "Building a nation that protects its people's rights | A foundation registered under No. 810 of 2024, serving Suez citizens and advancing development and human rights.\nLegal and development advice for every citizen | Submit your consultation or complaint and our team will follow it up.\nJoin us as a volunteer or member | Field initiatives across Suez districts need the hands of its people.",
  intro: "المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان، ومقرها الرئيسي محافظة السويس، مؤسسة أهلية مشهرة برقم 810 لسنة 2024، تعمل على تعزيز حقوق الإنسان وترسيخ قيم المواطنة، وتمكين الأسر الأولى بالرعاية، وبناء شراكات تنموية مع مؤسسات الدولة والمجتمع المدني.",
  intro_en: "The Egyptian National Foundation for Development and Human Rights, headquartered in Suez Governorate, is a civil organization registered under No. 810 of 2024. It promotes human rights and citizenship, empowers families in need, and builds development partnerships with state institutions and civil society.",
  vision: "أن تكون المؤسسة بيت الخبرة المجتمعي الأول في محافظة السويس في مجال التنمية وحقوق الإنسان، وأن يصل أثر برامجها إلى كل حي وقرية بالمحافظة دون استثناء.",
  vision_en: "To be the leading community house of expertise in Suez in development and human rights, with the impact of its programs reaching every district and village without exception.",
  mission: "تقديم خدمات قانونية وتنموية مجانية، وبناء قدرات الشباب والمرأة، ورصد احتياجات المواطنين والدفاع عن حقوقهم، من خلال لجان الأحياء وشراكات فاعلة مع الجهات الرسمية.",
  mission_en: "To provide free legal and development services, build the capacity of youth and women, monitor citizens' needs and defend their rights through district committees and active partnerships with official bodies.",
  chairmanWord: "", chairmanWord_en: "",
  ctaTitle: "لديك شكوى أو مقترح؟ أو ترغب في التطوع معنا؟", ctaTitle_en: "Have a complaint or suggestion? Want to volunteer with us?",
  ctaSub: "بابنا مفتوح لكل مواطن بالسويس — سجّل طلبك وسيتواصل معك فريق المؤسسة المختص.", ctaSub_en: "Our door is open to every Suez citizen — register your request and the relevant team will contact you.",
  servicesList: "الاستشارات القانونية المجانية | استشارات في الأحوال الشخصية والعمل والإيجار والتأمينات، يقدمها محامون متطوعون بالمقر الرئيسي وبمقرات لجان الأحياء.\nالمساندة والدفاع الحقوقي | متابعة شكاوى المواطنين وتقديم المساندة القانونية الكاملة للحالات الأولى بالرعاية من الاستشارة حتى إتمام الإجراءات.\nحماية الأسرة والطفل | الدفاع عن حقوق الطفل والأسرة، ورعاية الحالات الإنسانية، والتنسيق مع جهات الحماية الاجتماعية بالمحافظة.\nالتمكين الاقتصادي وريادة الأعمال | تدريب على دراسات الجدوى وإدارة المشروعات الصغيرة ومتناهية الصغر، وتيسير التمويل والتسويق للمشروعات.\nلجان الأحياء والتمثيل المجتمعي | لجان موزعة على أحياء المحافظة لرصد الاحتياجات وتلقي المقترحات ورفعها إلى إدارة المؤسسة والجهات المعنية.\nالتوعية والتثقيف الحقوقي | قوافل توعوية وندوات وإصدارات مبسطة تنشر الثقافة القانونية والوعي بالحقوق والواجبات بين المواطنين.",
  servicesList_en: "Free legal consultations | Advice on personal status, labor, rent and insurance, provided by volunteer lawyers at headquarters and district committees.\nAdvocacy and legal support | Following up citizens' complaints and providing full legal support for priority cases from consultation to completion.\nFamily and child protection | Defending the rights of children and families, caring for humanitarian cases and coordinating with social protection bodies.\nEconomic empowerment | Training in feasibility studies and small-business management, and easing financing and marketing for projects.\nDistrict committees | Committees across the governorate's districts to monitor needs, receive suggestions and pass them to management and relevant bodies.\nRights awareness | Awareness convoys, seminars and simple publications spreading legal culture and awareness of rights and duties.",
  goalsList: "الوعي الحقوقي | نشر الثقافة القانونية والوعي بالحقوق والواجبات بين مواطني السويس.\nتمكين اقتصادي | تمكين المرأة المعيلة والشباب من خلال التدريب والتأهيل ودعم المشروعات الصغيرة.\nحماية الأسرة والطفل | رعاية الفئات الأولى بالرعاية وحماية الطفل والأسرة من كل أشكال العنف.\nلجان الأحياء | تفعيل لجان الأحياء كجسر مباشر بين المواطن وإدارة المؤسسة.\nشراكات تنموية | بناء بروتوكولات تعاون مع مؤسسات الدولة ومنظمات المجتمع المدني.\nشفافية ومساءلة | إتاحة التقارير والبيانات الرسمية للجمهور وللمتابعة المجتمعية.",
  goalsList_en: "Rights awareness | Spreading legal culture and awareness of rights and duties among Suez citizens.\nEconomic empowerment | Empowering women breadwinners and youth through training, qualification and small-business support.\nFamily and child protection | Caring for priority groups and protecting children and families from all forms of violence.\nDistrict committees | Activating district committees as a direct bridge between citizens and management.\nDevelopment partnerships | Building cooperation protocols with state institutions and civil society organizations.\nTransparency and accountability | Making official reports and data available to the public and community follow-up.",
  structure: "مجلس الأمناء | يرسم السياسات العامة ويعتمد الخطط والموازنات والتقارير السنوية.",
  structure_en: "Board of Trustees | Sets general policies and approves plans, budgets and annual reports.",
  steps: "تقديم الطلب | املأ النموذج أدناه أو تقدم بالمقر — لا يشترط أي رسوم.\nالمراجعة والتصنيف | تُراجع الشكوى من الإدارة القانونية وتُصنّف حسب النوع والحي.\nالتواصل | يتواصل معك فريق المؤسسة على رقم الهاتف المسجل خلال أيام العمل.\nالمتابعة حتى الإغلاق | تتابع الحالة حتى إتمام الإجراء أو تحويلها للجهة المختصة.",
  steps_en: "Submit your request | Fill in the form below or visit our office — no fees required.\nReview and classification | The legal department reviews the complaint and classifies it by type and district.\nContact | Our team contacts you on the registered phone number during working days.\nFollow-up until closure | The case is followed until completion or referral to the competent authority.",
  districts: "حي الأربعين | متابعة احتياجات المواطنين وتنظيم القوافل التنموية بالحي.\nحي فيصل | رصد المشكلات الخدمية وتلقي شكاوى ومقترحات الأهالي.\nحي عتاقة | العمل التنموي وبرامج التمكين الاقتصادي للشباب والمرأة.\nحي السلام | خدمات الدعم الاجتماعي ومتابعة الحالات الأولى بالرعاية.\nحي الجناين | دعم الأسر الريفية ومتابعة احتياجات القرى التابعة.\nحي السويس | التنسيق مع الجهات الرسمية ومتابعة الشكاوى العاجلة.",
  districts_en: "Al-Arbaeen District | Following citizens' needs and organizing development convoys in the district.\nFaisal District | Monitoring service problems and receiving residents' complaints and suggestions.\nAtaka District | Development work and economic empowerment programs for youth and women.\nAl-Salam District | Social support services and follow-up of priority cases.\nAl-Ganayen District | Supporting rural families and following the needs of affiliated villages.\nSuez District | Coordinating with official bodies and following urgent complaints.",
  licenseText: "المؤسسة كيان أهلي مشهر وفقًا لقانون الجمعيات والمؤسسات الأهلية، وتعمل تحت رقابة الجهة الإدارية المختصة.",
  licenseText_en: "The foundation is a civil entity registered under the law on associations and civil institutions, operating under the supervision of the competent administrative authority.",
  licenseNo: "810", licenseYear: "2024", scope: "محافظة السويس", scope_en: "Suez Governorate",
  hqNote: "المؤسسة تعمل من مقرها الرئيسي بمحافظة السويس، ولها فروع أخرى في عدد من محافظات الجمهورية.",
  hqNote_en: "The foundation operates from its headquarters in Suez Governorate and has other branches in several governorates.",
  about_title: "هويتنا… ورسالتنا الوطنية", about_title_en: "Our identity… our national mission",
  about_sub: "المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان بمحافظة السويس — المقر الرئيسي. مؤسسة أهلية مشهرة تعمل على الأرض، بلجان في كل حي، وبشراكات مع مؤسسات الدولة.",
  about_sub_en: "Egyptian National Foundation for Development and Human Rights in Suez — headquarters. A registered civil foundation working on the ground, with committees in every district and partnerships with state institutions.",
  services_title: "خدماتنا… حقك الذي لا ينتظر", services_title_en: "Our services… your right that cannot wait",
  services_sub: "استشارات قانونية مجانية، مساندة حقوقية، دعم تنموي، وتمثيل مجتمعي عبر لجان الأحياء. وتستطيع من هنا تقديم شكوى أو مقترح، أو طلب الانضمام للمؤسسة.",
  services_sub_en: "Free legal advice, rights advocacy, development support and community representation through district committees. From here you can submit a complaint, a suggestion or a membership request.",
  media_title: "أخبار وبيانات وفاعليات المؤسسة", media_title_en: "News, statements and events of the foundation", media_sub: "", media_sub_en: "",
  contact_title: "بابنا مفتوح… وصوتك مسموع", contact_title_en: "Our door is open… your voice is heard",
  contact_sub: "تواصل مع المؤسسة عبر النموذج الإلكتروني أو وسائل الاتصال الرسمية، أو زر مقرنا في محافظة السويس.",
  contact_sub_en: "Contact the foundation through the online form or official channels, or visit our headquarters in Suez.",
  address: "السويس، جمهورية مصر العربية", address_en: "Suez, Arab Republic of Egypt",
  hours: "السبت – الخميس، من 10 صباحًا حتى 4 عصرًا", hours_en: "Saturday – Thursday, 10 AM – 4 PM",
  copyright: "© 2026 المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان — محافظة السويس. جميع الحقوق محفوظة.",
  copyright_en: "© 2026 Egyptian National Foundation for Development and Human Rights — Suez. All rights reserved.",
  phone: "", email: "", mapQuery: "Suez, Egypt", whatsapp: "", telegram: "", youtube: "", facebook: "", instagram: ""
};
const loadSite = async () => ({ ...DEFAULTS, ...((await readDoc("site")) || {}) });
const loadList = async (name, max) => { try { return (await getDocs(query(collection(db, name), orderBy("createdAt", "desc"), limit(max)))).docs.map((d) => d.data()); } catch { return []; } };
const BLOCKS = [["leaders", "بطاقتا القيادات في الواجهة"], ["stats", "شريط الإحصائيات"], ["intro", "من نحن + الرؤية والرسالة"], ["services", "بطاقات الخدمات"], ["news", "أحدث الأخبار"], ["strip", "لقطات الفاعليات"], ["word", "كلمة رئيس المؤسسة"], ["cta", "شريط الدعوة للتواصل"]];
const TABS = [["about", "عن المؤسسة"], ["services", "الخدمات والدعم"], ["media", "المركز الإعلامي"], ["contact", "اتصل بنا"]];
const IMG_KEYS = [["logo", "الشعار", 512, 0.9], ["hero", "صورة الخلفية الرئيسية", 1600, 0.78], ["governor", "صورة السيد المحافظ", 640, 0.82], ["chairman", "صورة رئيس مجلس الأمناء", 640, 0.82]];
const DEFAULT_IMG = { logo: "assets/logo.jpg", hero: "assets/hero.jpg", governor: "assets/governor.jpg", chairman: "assets/chairman.jpg" };

/* ============ 5) اللغة: عربي / English ============ */
let lang = (() => { try { return localStorage.getItem("lang") === "en" ? "en" : "ar"; } catch { return "ar"; } })();
const EN = {
  "آلية العمل": "How it works", "أحدث الأخبار والفاعليات بالسويس": "Latest news and events in Suez", "أرسل رسالتك مباشرة إلى المؤسسة": "Send your message directly to the foundation",
  "أهداف يجرى العمل عليها على أرض محافظة السويس.": "Goals being pursued on the ground in Suez Governorate.", "أهدافنا": "Our goals", "أهدافنا الوطنية والتنموية": "Our national and development goals",
  "إلى أين نتجه؟ ولماذا نعمل؟": "Where are we heading, and why do we work?", "اتصل بنا": "Contact us", "استشارات قانونية مجانية": "Free legal consultations", "الأخبار": "News",
  "الاتجاهات على الخريطة": "Directions on the map", "البيانات الصحفية": "Press statements", "الترخيص والشخصية القانونية": "Licensing and legal status", "التقديم الإلكتروني": "Online application",
  "الخدمات المتاحة": "Available services", "الخدمات والدعم": "Services & support", "الخدمات والدعم المجتمعي": "Services & community support", "الرؤية والرسالة": "Vision and mission", "الرئيسية": "Home",
  "العضوية والتطوع متاحان لكل من يريد المساهمة في العمل التنموي والحقوقي بالسويس.": "Membership and volunteering are open to anyone who wants to contribute to development and rights work in Suez.",
  "المؤسسة المصرية الوطنية": "Egyptian National Foundation", "المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان": "Egyptian National Foundation for Development and Human Rights",
  "المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان بالسويس": "Egyptian National Foundation for Development and Human Rights — Suez", "المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان — محافظة السويس": "Egyptian National Foundation for Development and Human Rights — Suez Governorate",
  "المركز الإعلامي": "Media center", "الهيكل التنظيمي": "Organizational structure", "انضم إلينا": "Join us",
  "بالضغط على «انضم إلينا» وتسجيل الدخول بحساب Gmail فإنك توافق على حفظ اسمك وبريدك لإرسال أخبار المؤسسة، ويمكنك الخروج في أي وقت.": "By pressing “Join us” and signing in with Gmail you agree to us saving your name and email to send foundation news. You can sign out at any time.",
  "برامج تنموية مستدامة": "Sustainable development programs", "بيانات التواصل": "Contact details", "بيانات المؤسسة": "Foundation details", "تظهر هنا الطلبات المرسلة من هذا الجهاز فقط، ولا يراها غيرك.": "Only requests sent from this device appear here; nobody else can see them.",
  "تعرّف على المؤسسة": "About the foundation", "تقديم شكوى": "Submit a complaint", "تقديم طلب أو شكوى ←": "Submit a request or complaint →", "تقديم طلب انضمام": "Apply to join",
  "تُراجع الحالات ذات الطابع العاجل بشكل أولوي بالتنسيق مع لجنة الحي.": "Urgent cases are reviewed with priority in coordination with the district committee.",
  "تُسجَّل الشكوى فورًا في سجل المؤسسة ولا يمكن تعديل حالتها إلا من الإدارة المختصة.": "The complaint is logged immediately in the foundation's register and its status can only be changed by the competent administration.",
  "جميع الطلبات تُراجع من الإدارة القانونية والمكتب التنفيذي للمؤسسة، وتُحفظ بياناتك بسرية تامة.": "All requests are reviewed by the legal department and executive office, and your data is kept strictly confidential.",
  "خدمات مجانية لكل مواطن في السويس": "Free services for every citizen in Suez", "خدماتنا ومبادراتنا": "Our services and initiatives", "خدمة مقدمة للمواطنين": "Services delivered to citizens", "دخول الإدارة": "Admin login",
  "رؤيتنا": "Our vision", "رسالتنا": "Our mission", "روابط سريعة": "Quick links", "شكوى أو مقترح": "Complaint or suggestion", "صفحة الاتصال ←": "Contact page →", "طلب استشارة": "Consultation request",
  "طلبات التغطية الإعلامية والتصريحات": "Media coverage and statement requests", "طلباتي المسجلة": "My registered requests", "عضوية وتطوع": "Membership & volunteering", "عن المؤسسة": "About us",
  "فريق المكتب القانوني متاح للرد على استفساراتك خلال ساعات العمل الرسمية.": "The legal office team is available to answer your inquiries during official working hours.",
  "قدّم شكواك أو طلب انضمامك": "Submit your complaint or membership request", "قيادات نفتخر بها": "Leaders we are proud of", "كل الأخبار ←": "All news →", "كلمة رئيس المؤسسة": "Message from the Chairman",
  "كلمة رئيس المؤسسة والهيكل التنظيمي ←": "Chairman's message and structure →", "كن جزءًا من التغيير في محافظتك": "Be part of the change in your governorate", "كيف تصل شكواك إلى الحل؟": "How does your complaint reach a solution?",
  "لجان الأحياء": "District committees", "لجان تطوعية تنقل احتياجات المواطنين من الشارع إلى إدارة المؤسسة، وتتابع تنفيذ الخدمات على الأرض.": "Volunteer committees carrying citizens' needs from the street to management and following up services on the ground.",
  "لجان تغطي كل أحياء المحافظة": "Committees covering every district", "لجان في كل أحياء المحافظة": "Committees in every district", "لجنة أحياء بالمحافظة": "District committees", "لقطات من فاعليات المؤسسة": "Snapshots from the foundation's events",
  "للتواصل مع المكتب الإعلامي وطلب تغطية أو تصريح رسمي، يرجى مراسلتنا عبر صفحة الاتصال.": "To reach the media office and request coverage or an official statement, please contact us via the contact page.",
  "للمساعدة الفورية يمكنك التواصل معنا عبر واتساب أو الهاتف خلال ساعات العمل.": "For immediate help, contact us via WhatsApp or phone during working hours.", "لوحة التحكم": "Dashboard",
  "مؤسسة من أبناء السويس… لخدمة أبناء السويس": "A foundation by the people of Suez… for the people of Suez", "ما الذي نقدمه لأبناء السويس؟": "What do we offer the people of Suez?", "ماذا يحدث بعد الإرسال؟": "What happens after you submit?",
  "مبادرة وبرنامج منفذ": "Initiatives and programs delivered", "محافظة السويس": "Suez Governorate", "محافظة السويس — جمهورية مصر العربية": "Suez Governorate — Arab Republic of Egypt", "مراسلة المكتب الإعلامي": "Contact the media office",
  "مستفيد من برامجنا": "Beneficiaries of our programs", "مشهرة برقم 810 لسنة 2024": "Registered under No. 810 of 2024", "معرض الصور الكامل": "Full gallery", "معرض الصور والفيديو": "Photo & video gallery", "مقر المؤسسة": "Foundation headquarters",
  "من القلب… إلى أبناء السويس": "From the heart… to the people of Suez", "من الميدان": "From the field", "من نحن": "Who we are", "من يدار العمل؟ وكيف تُتخذ القرارات؟": "Who runs the work, and how are decisions made?",
  "موقع المقر على الخريطة": "Headquarters on the map", "نموذج التواصل": "Contact form", "هل تحتاج مساعدة فورية؟": "Need immediate help?",
  "هيكل واضح يضمن الشفافية والمساءلة، ويجعل صوت المواطن جزءًا من دورة القرار داخل المؤسسة.": "A clear structure that ensures transparency and accountability and makes the citizen's voice part of the decision cycle.",
  "يمكنك الاطلاع على طلباتك المرسلة من هذا الجهاز في قائمة «طلباتي المسجلة».": "You can view the requests sent from this device in the “My registered requests” list.",
  /* نصوص ديناميكية */
  "طلب استشارة قانونية أو تنموية": "Legal or development consultation request", "طلب عضوية أو تطوع": "Membership or volunteering request", "أرسل لنا رسالة": "Send us a message", "الاسم": "Name", "رقم الهاتف": "Phone number",
  "اشرح طلبك": "Describe your request", "النوع": "Type", "شكوى": "Complaint", "مقترح": "Suggestion", "التفاصيل": "Details", "الاسم بالكامل": "Full name", "عضوية": "Membership", "تطوع": "Volunteering", "الحي": "District", "رسالتك": "Your message",
  "إرسال": "Send", "تم الإرسال بنجاح، سنتواصل معك قريبًا.": "Sent successfully. We will contact you soon.", "تعذر الإرسال، حاول لاحقًا أو تواصل عبر واتساب.": "Could not send. Please try later or contact us on WhatsApp.",
  "الاسم قصير جدًا.": "The name is too short.", "رقم الهاتف غير صحيح.": "The phone number is invalid.", "خروج": "Sign out", "تم الاشتراك وتسجيل الدخول بنجاح.": "Subscribed and signed in successfully.",
  "لا توجد طلبات مسجلة بعد.": "No registered requests yet.", "قيد المراجعة": "Under review", "استشارة": "Consultation", "شكوى/مقترح": "Complaint/suggestion", "عضوية/تطوع": "Membership/volunteering", "رسالة": "Message",
  "لا توجد أخبار منشورة بعد.": "No news published yet.", "لا توجد بيانات صحفية بعد.": "No press statements yet.", "لا توجد وسائط بعد.": "No media yet.", "ستظهر هنا لقطات الفاعليات بعد رفعها من لوحة التحكم.": "Event snapshots will appear here once uploaded from the dashboard.",
  "صادر عن المكتب الإعلامي": "Issued by the media office", "رقم المشهر": "Registration number", "سنة المشهر": "Registration year", "نطاق العمل": "Scope of work", "العنوان": "Address", "الهاتف": "Phone", "البريد الإلكتروني": "Email", "مواعيد العمل": "Working hours",
  "يوتيوب": "YouTube", "فيسبوك": "Facebook", "إنستجرام": "Instagram", "تلجرام": "Telegram", "واتساب": "WhatsApp", "لجنة": "Committee", "سيتم إضافة المحتوى قريبًا.": "Content will be added soon.", "سيتم إضافة كلمة رئيس مجلس الأمناء قريبًا.": "The chairman's message will be added soon.",
  "عرض بالحجم الكامل": "View full size", "إغلاق": "Close", "السابق": "Previous", "التالي": "Next", "انتظر": "Please wait", "ثانية قبل الإرسال مرة أخرى.": "seconds before sending again."
};
const tr = (s) => (lang === "en" ? EN[String(s).trim()] ?? s : s);
const L = (o, k) => (lang === "en" && o?.[`${k}_en`]) || tr(o?.[k] ?? "");
const items = (key) => lines(L(DATA.site, key)).map((l) => l.split("|").map((x) => tr(x.trim())));
const fmtDate = (t) => (t?.toDate ? t.toDate().toLocaleDateString(lang === "en" ? "en-GB" : "ar-EG") : "");

const origText = new WeakMap();
function translateStatic() { // يترجم النصوص الثابتة في الصفحة عبر القاموس
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode()); ) {
    if (!n.nodeValue.trim() || n.parentElement.closest("script,style")) continue;
    if (!origText.has(n)) { if (!/[\u0600-\u06FF]/.test(n.nodeValue)) continue; origText.set(n, n.nodeValue); }
    const ar = origText.get(n), key = ar.trim();
    n.nodeValue = lang === "en" ? ar.replace(key, EN[key] ?? key) : ar;
  }
}
function applyLangAttrs() {
  const root = document.documentElement;
  root.lang = lang; root.dir = lang === "en" ? "ltr" : "rtl";
  document.title = lang === "en" ? "Egyptian National Foundation for Development and Human Rights — Suez" : "المؤسسة المصرية الوطنية والتنمية وحقوق الإنسان بالسويس";
}

/* ============ 6) الموقع العام ============ */
const DATA = { site: DEFAULTS, news: [], press: [], gallery: [], stats: {}, extra: { theme: null, layout: null, imgs: {}, sections: [] } };
let slideTimer;

function mediaNode(m, cls) { // صورة | فيديو | يوتيوب
  const u = safeUrl(m.url || m.imageUrl);
  if (!u) return null;
  if (m.mediaType === "youtube") {
    const id = ytId(u); if (!id) return null;
    const f = el("iframe", cls); f.src = `https://www.youtube-nocookie.com/embed/${id}`; f.allowFullscreen = true; f.loading = "lazy"; f.title = L(m, "title") || "video"; return f;
  }
  if (m.mediaType === "video") { const v = el("video", cls); v.src = u; v.controls = true; v.preload = "metadata"; return v; }
  const i = el("img", cls); i.src = u; i.alt = L(m, "title") || L(m, "caption") || ""; i.loading = "lazy"; return i;
}
const emptyNote = (box, text, cls = "text-gray-500") => box.append(el("p", `${cls} p-4 col-span-full`, tr(text)));

function openLightbox(seq, start) { // عرض الصورة أو الفيديو بالحجم الكامل مع الوصف والتنقل
  let i = start;
  const ov = el("div", "fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 gap-3");
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  const stage = el("div", "w-full max-w-5xl flex-1 min-h-0 flex items-center justify-center"), info = el("div", "w-full max-w-3xl text-white text-center max-h-[28vh] overflow-auto space-y-1");
  const mk = (cls, text, label, fn) => { const b = el("button", cls, text); b.type = "button"; b.setAttribute("aria-label", tr(label)); b.addEventListener("click", fn); return b; };
  const go = (d) => { i = (i + d + seq.length) % seq.length; paint(); };
  const close = () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; ov.remove(); };
  const onKey = (e) => { const dir = document.documentElement.dir === "rtl" ? -1 : 1; if (e.key === "Escape") close(); else if (e.key === "ArrowRight") go(dir); else if (e.key === "ArrowLeft") go(-dir); };
  function paint() {
    const it = seq[i], yt = it.m.mediaType === "youtube";
    stage.replaceChildren(mediaNode(it.m, yt ? "w-full aspect-video rounded-xl" : "max-h-[62vh] max-w-full rounded-xl object-contain") || el("p", "text-white", "—"));
    info.replaceChildren(el("div", "text-xs opacity-70", it.date), el("h3", "display text-xl", it.title), el("p", "text-sm opacity-90 whitespace-pre-line leading-7", it.body));
    if (seq.length > 1) info.append(el("div", "text-xs opacity-60", `${i + 1} / ${seq.length}`));
  }
  ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
  ov.append(mk("absolute top-3 end-4 text-white text-4xl leading-none px-2", "×", "إغلاق", close), stage, info);
  if (seq.length > 1) ov.append(mk("absolute start-2 top-1/2 text-white text-3xl px-3 py-4 rtl:rotate-180", "❮", "السابق", () => go(-1)), mk("absolute end-2 top-1/2 text-white text-3xl px-3 py-4 rtl:rotate-180", "❯", "التالي", () => go(1)));
  document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; document.body.append(ov); paint();
}
const mediaList = (n) => [{ url: n.url || n.imageUrl, mediaType: n.mediaType || "image" }, ...(Array.isArray(n.more) ? n.more : [])].filter((m) => safeUrl(m.url));
const itemSeq = (n) => mediaList(n).map((m) => ({ m, title: L(n, "title") || L(n, "caption"), body: L(n, "body"), date: fmtDate(n.createdAt) }));
function zoomable(node, seq, idx) { if (node?.tagName === "IMG") { node.classList.add("cursor-zoom-in"); node.addEventListener("click", () => openLightbox(seq, idx)); } return node; }
function thumbRow(seq) { // صور مصغرة للوسائط الإضافية (حتى 3)
  const row = el("div", "flex gap-2 p-2 pb-0");
  seq.slice(1, 4).forEach((it, k) => {
    const b = el("button", "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border bg-black/30"); b.type = "button"; b.setAttribute("aria-label", tr("عرض بالحجم الكامل"));
    if (it.m.mediaType === "image") { const im = el("img", "h-full w-full object-cover"); im.src = it.m.url; im.alt = ""; im.loading = "lazy"; b.append(im); } else b.append(el("span", "grid h-full place-items-center text-white", "▶"));
    b.addEventListener("click", () => openLightbox(seq, k + 1)); row.append(b);
  });
  return row;
}
const viewBtn = (seq) => { const b = el("button", "btn-ghost text-sm mt-3 self-start", `${tr("عرض بالحجم الكامل")}${seq.length > 1 ? ` (${seq.length})` : ""}`); b.type = "button"; b.addEventListener("click", () => openLightbox(seq, 0)); return b; };

function renderNews(box, list) {
  box.replaceChildren();
  if (!list.length) return emptyNote(box, "لا توجد أخبار منشورة بعد.");
  for (const n of list) {
    const card = el("article", "card overflow-hidden lift"), seq = itemSeq(n), main = seq.length ? mediaNode(seq[0].m, "h-44 w-full object-cover") : null;
    if (main) card.append(zoomable(main, seq, 0));
    if (seq.length > 1) card.append(thumbRow(seq));
    const b = el("div", "p-4");
    b.append(el("div", "text-xs text-gray-500", fmtDate(n.createdAt)), el("h3", "font-bold text-royal mt-1", L(n, "title")), el("p", "text-sm mt-2 text-gray-700 whitespace-pre-line", L(n, "body")));
    card.append(b); box.append(card);
  }
}
function renderPress(box, list) {
  box.replaceChildren();
  if (!list.length) return box.append(el("li", "p-4 text-gray-500", tr("لا توجد بيانات صحفية بعد.")));
  for (const p of list) {
    const li = el("li", "p-4 flex flex-col sm:flex-row gap-4"), seq = itemSeq(p), main = seq.length ? mediaNode(seq[0].m, "w-full sm:w-40 h-28 object-cover rounded-xl shrink-0") : null;
    if (main) li.append(zoomable(main, seq, 0));
    const t = el("div", "flex-1");
    t.append(el("div", "text-xs text-gray-500", `${fmtDate(p.createdAt)} — ${tr("صادر عن المكتب الإعلامي")}`), el("b", "text-royal", L(p, "title")), el("p", "text-sm mt-1 text-gray-700 whitespace-pre-line", L(p, "body")));
    li.append(t); box.append(li);
  }
}
function renderGallery(box, list) {
  box.replaceChildren();
  const rows = list.map((g) => ({ g, seq: itemSeq(g) })).filter((x) => x.seq.length);
  if (!rows.length) return emptyNote(box, "لا توجد وسائط بعد.");
  for (const { g, seq } of rows) {
    const card = el("article", "card overflow-hidden lift flex flex-col"), wrap = el("div", "bg-black/30 aspect-video overflow-hidden"), mn = mediaNode(seq[0].m, "w-full h-full object-cover");
    if (mn) wrap.append(zoomable(mn, seq, 0));
    card.append(wrap);
    if (seq.length > 1) card.append(thumbRow(seq));
    const b = el("div", "p-4 flex flex-col flex-1");
    b.append(el("div", "text-xs text-gray-500", seq[0].date), el("h3", "font-bold text-royal mt-1 line-clamp-2", seq[0].title), seq[0].body ? el("p", "text-sm mt-2 text-gray-700 leading-7 line-clamp-3 whitespace-pre-line", seq[0].body) : el("span"), viewBtn(seq));
    card.append(b); box.append(card);
  }
}
function renderStrip(box, list) {
  box.replaceChildren();
  const rows = list.map((g) => ({ seq: itemSeq(g) })).filter((x) => x.seq.length && x.seq[0].m.mediaType === "image").slice(0, 4);
  if (!rows.length) return emptyNote(box, "ستظهر هنا لقطات الفاعليات بعد رفعها من لوحة التحكم.", "muted");
  for (const { seq } of rows) { const t = el("figure", "tile"); t.append(zoomable(mediaNode(seq[0].m, ""), seq, 0)); if (seq[0].title) t.append(el("span", "line-clamp-2", seq[0].title)); box.append(t); }
}
const numCard = (n, title, text) => { const c = el("article", "card p-6 lift"); c.append(el("div", "num", String(n).padStart(2, "0")), el("h3", "display text-xl mt-4 text-white", title), el("p", "text-sm mt-2 leading-7 muted", text)); return c; };

/* النماذج: فخ البوتات + مهلة + تنظيف المدخلات */
const FORMS = {
  consultation: { title: "طلب استشارة قانونية أو تنموية", fields: [["name", "الاسم"], ["phone", "رقم الهاتف"], ["message", "اشرح طلبك", "area"]] },
  complaint: { title: "شكوى أو مقترح", fields: [["name", "الاسم"], ["phone", "رقم الهاتف"], ["kind", "النوع", ["شكوى", "مقترح"]], ["message", "التفاصيل", "area"]] },
  membership: { title: "طلب عضوية أو تطوع", fields: [["name", "الاسم بالكامل"], ["phone", "رقم الهاتف"], ["kind", "النوع", ["عضوية", "تطوع"]], ["district", "الحي"]] },
  contact: { title: "أرسل لنا رسالة", fields: [["name", "الاسم"], ["phone", "رقم الهاتف"], ["message", "رسالتك", "area"]] }
};
function buildField([name, label, kind = "text"]) {
  let input;
  if (Array.isArray(kind)) { input = el("select", "field"); kind.forEach((o) => { const op = new Option(tr(o), o); input.append(op); }); }
  else {
    input = el(kind === "area" ? "textarea" : "input", "field");
    if (kind === "area") { input.rows = 4; input.maxLength = 2000; } else { input.type = name === "phone" ? "tel" : "text"; input.maxLength = 200; }
    input.placeholder = tr(label);
  }
  input.name = name; input.required = name !== "district"; input.setAttribute("aria-label", tr(label));
  return input;
}
async function submitForm(e) {
  e.preventDefault();
  const form = e.currentTarget, note = $(".note", form), btn = $("button", form);
  const say = (t, ok) => { note.textContent = t; note.className = `note text-sm ${ok ? "text-green-600" : "text-red-600"}`; };
  if (form.elements.website.value) return;
  const sentLog = readJson("sentLog", []).filter((t) => Date.now() - t < 3_600_000);
  if (Date.now() - Number(form.dataset.t) < 2500 || sentLog.length >= 5) return say(tr("تعذر الإرسال، حاول لاحقًا أو تواصل عبر واتساب."), false);
  const wait = 60_000 - (Date.now() - store.get("lastSent"));
  if (wait > 0) return say(`${tr("انتظر")} ${Math.ceil(wait / 1000)} ${tr("ثانية قبل الإرسال مرة أخرى.")}`, false);
  const data = { type: form.dataset.type };
  for (const [k, v] of new FormData(form)) if (k !== "website") data[k] = clean(v, k === "message" ? 2000 : 200);
  if (data.name.length < 2) return say(tr("الاسم قصير جدًا."), false);
  if (!/^[0-9+\-\s]{7,20}$/.test(data.phone)) return say(tr("رقم الهاتف غير صحيح."), false);
  btn.disabled = true;
  try { await addDoc(collection(db, "messages"), { ...data, status: "new", createdAt: serverTimestamp() }); store.set("lastSent", Date.now()); writeJson("sentLog", [...sentLog, Date.now()]); rememberRequest(data); form.reset(); say(tr("تم الإرسال بنجاح، سنتواصل معك قريبًا."), true); }
  catch { say(tr("تعذر الإرسال، حاول لاحقًا أو تواصل عبر واتساب."), false); }
  finally { btn.disabled = false; }
}
function renderForms() {
  document.querySelectorAll("[data-form]").forEach((box) => {
    const def = FORMS[box.dataset.form], form = el("form", "space-y-3 relative");
    form.dataset.type = box.dataset.form; form.dataset.t = String(Date.now());
    const trap = el("input", "hp"); trap.name = "website"; trap.tabIndex = -1; trap.autocomplete = "off"; trap.setAttribute("aria-hidden", "true");
    const btn = el("button", "btn w-full", tr("إرسال")); btn.type = "submit";
    form.append(el("h3", "font-bold text-royal", tr(def.title)), ...def.fields.map(buildField), trap, btn, el("p", "note text-sm"));
    form.addEventListener("submit", submitForm);
    box.replaceChildren(form);
  });
}
const TYPES = { consultation: "استشارة", complaint: "شكوى/مقترح", membership: "عضوية/تطوع", contact: "رسالة" };
function renderMine() {
  const box = $("#mine"), list = readJson("myRequests", []);
  if (!box) return;
  box.replaceChildren(...(list.length ? list.map((r) => {
    const li = el("li", "card p-3 text-sm");
    li.append(el("b", "text-royal", `${tr(TYPES[r.type] || r.type)}${r.kind ? ` — ${tr(r.kind)}` : ""}`), el("p", "muted mt-1", r.note), el("p", "text-xs muted mt-1", `${r.date} — ${tr("قيد المراجعة")}`));
    return li;
  }) : [el("li", "muted text-sm", tr("لا توجد طلبات مسجلة بعد."))]));
}
function rememberRequest(data) {
  const list = [{ type: data.type, kind: data.kind || "", note: clean(data.message || data.district || "", 70), date: new Date().toLocaleDateString(lang === "en" ? "en-GB" : "ar-EG") }, ...readJson("myRequests", [])].slice(0, 10);
  writeJson("myRequests", list); renderMine();
}

/* التوجيه بين التبويبات */
function route(keepScroll) {
  const views = [...document.querySelectorAll("[data-view]")], hash = location.hash.slice(1);
  let id = views.some((v) => v.dataset.view === hash) ? hash : "home";
  if (document.querySelector(`.tab[href="#${id}"]`)?.classList.contains("hidden")) id = "home";
  views.forEach((v) => v.classList.toggle("hidden", v.dataset.view !== id));
  document.querySelectorAll(".tab").forEach((a) => { const on = a.hash === `#${id}`; a.classList.toggle("active", on); a.setAttribute("aria-selected", on); });
  $("#menu-m").classList.add("hidden");
  if (!keepScroll) scrollTo(0, 0);
}
function bindSwitch(key) {
  const buttons = document.querySelectorAll(`.seg[data-${key}]`), panels = document.querySelectorAll(`[data-${key}]:not(.seg)`);
  buttons.forEach((b) => b.addEventListener("click", () => {
    buttons.forEach((x) => x.classList.toggle("active", x === b));
    panels.forEach((p) => p.classList.toggle("hidden", p.dataset[key] !== b.dataset[key]));
  }));
}

function renderCustom(list) {
  $("#custom-home").replaceChildren(); $("#views").replaceChildren();
  document.querySelectorAll(".tab[data-custom]").forEach((a) => a.remove());
  for (const s of list) {
    const body = () => { const box = el("div", "space-y-5"), m = mediaNode(s, "rounded-2xl border w-full max-h-96 object-cover"); if (m) box.append(m); box.append(el("p", "leading-8 whitespace-pre-line text-gray-300", L(s, "body"))); return box; };
    if (s.place === "home") {
      const w = el("div", "max-w-6xl mx-auto px-4 pb-10 md:pb-16"); w.append(el("h2", "display text-3xl text-white", L(s, "title")), el("div", "gold-line mb-6"), body());
      $("#custom-home").append(w);
    } else {
      const id = `sec-${s.id}`, view = el("section", "hidden"), head = el("div", "banner"), inner = el("div", "max-w-6xl mx-auto px-4 py-8 md:py-12"), main = el("div", "max-w-6xl mx-auto px-4 py-8 md:py-12");
      view.dataset.view = id; view.setAttribute("role", "tabpanel");
      inner.append(el("h1", "display text-3xl md:text-5xl text-white", L(s, "title")), el("div", "gold-line")); head.append(inner); main.append(body()); view.append(head, main); $("#views").append(view);
      document.querySelectorAll("nav[role=tablist]").forEach((nav) => { const a = el("a", "tab", L(s, "title")); a.href = `#${id}`; a.setAttribute("role", "tab"); a.dataset.custom = "1"; nav.insertBefore(a, nav.querySelector('[data-tab="contact"]')); });
    }
  }
}

function applyExtras() {
  const { theme, layout, imgs, sections } = DATA.extra;
  applyTheme(theme || {});
  for (const [k, data] of Object.entries(imgs)) {
    if (!isDataImg(data)) continue;
    if (k === "hero") document.documentElement.style.setProperty("--hero-img", `url("${data}")`);
    else document.querySelectorAll(`[data-img="${k}"]`).forEach((i) => { i.src = data; });
  }
  const hidden = layout?.hidden || [], labels = layout?.labels || {};
  document.querySelectorAll("[data-block]").forEach((n) => n.classList.toggle("hidden", hidden.includes(n.dataset.block)));
  document.querySelectorAll(".tab[data-tab]").forEach((a) => { const t = a.dataset.tab; a.classList.toggle("hidden", hidden.includes(`tab:${t}`)); if (labels[t]) a.textContent = clean(lang === "en" && labels[`${t}_en`] ? labels[`${t}_en`] : labels[t], 40); });
  renderCustom(sections.filter((s) => s.visible !== "no"));
  route(true);
}


const ICONS = {
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  telegram: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
};
function svgIcon(d) {
  const ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg"), p = document.createElementNS(ns, "path");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", "18"); s.setAttribute("height", "18"); s.setAttribute("fill", "currentColor"); s.setAttribute("aria-hidden", "true");
  p.setAttribute("d", d); s.append(p); return s;
}

function renderAll() {
  const { site, news, press, gallery, stats } = DATA;
  document.querySelectorAll("[data-bind]").forEach((n) => {
    const k = n.dataset.bind;
    n.textContent = L(site, k) || (k.endsWith("_sub") ? "" : tr(k === "chairmanWord" ? "سيتم إضافة كلمة رئيس مجلس الأمناء قريبًا." : "سيتم إضافة المحتوى قريبًا."));
  });
  const slides = items("slides").map(([t, x = ""]) => { const s = el("div", "slide"); s.append(el("b", "display text-xl text-white block", t), el("p", "mt-1 leading-7", x)); return s; });
  $("#slides").replaceChildren(...slides);
  let i = 0; slides[0]?.classList.add("on"); clearInterval(slideTimer);
  if (slides.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches)
    slideTimer = setInterval(() => { slides[i].classList.remove("on"); i = (i + 1) % slides.length; slides[i].classList.add("on"); }, 5000);

  for (const k of ["initiatives", "services", "beneficiaries", "committees"]) $(`#st-${k}`).textContent = Number(stats[k] ?? 0).toLocaleString("en-US");
  $("#c-news").textContent = news.length; $("#c-press").textContent = press.length; $("#c-gallery").textContent = gallery.length;
  renderNews($("#news-home"), news.slice(0, 3)); renderNews($("#news"), news); renderPress($("#press"), press); renderGallery($("#gallery"), gallery); renderStrip($("#strip"), gallery);

  const cards = items("servicesList").map(([t, x = ""], n) => numCard(n + 1, t, x));
  $("#services-grid").replaceChildren(...cards); $("#services-grid2").replaceChildren(...items("servicesList").map(([t, x = ""], n) => numCard(n + 1, t, x)));
  $("#goals-grid").replaceChildren(...items("goalsList").map(([t, x = ""], n) => numCard(n + 1, t, x)));
  $("#steps").replaceChildren(...items("steps").map(([t, x = ""], n) => numCard(n + 1, t, x)));
  $("#structure").replaceChildren(...items("structure").map(([t, x = ""]) => { const c = el("div", "card p-5 border-s-4"); c.style.borderInlineStartColor = "var(--gold)"; c.append(el("h3", "display text-xl text-white", t), el("p", "muted text-sm mt-1 leading-7", x)); return c; }));
  $("#districts").replaceChildren(...items("districts").map(([n, x = ""]) => { const c = el("div", "card p-5 lift"); c.append(el("span", "tag", n), el("h3", "display text-xl text-white mt-3", lang === "en" ? `${n} Committee` : `لجنة ${n}`), el("p", "muted text-sm mt-2 leading-7", x)); return c; }));

  $("#license-rows").replaceChildren(...[["رقم المشهر", site.licenseNo], ["سنة المشهر", site.licenseYear], ["نطاق العمل", L(site, "scope")]].filter((r) => r[1]).map(([k, v]) => { const r = el("div", "card px-4 py-3 flex justify-between text-sm"); r.append(el("span", "muted", tr(k)), el("b", "text-royal", v)); return r; }));
  const q = encodeURIComponent(site.mapQuery || "Suez, Egypt");
  $("#hq-address").textContent = L(site, "address"); $("#hq-link").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const map = $("#map"), src = `https://www.google.com/maps?q=${q}&output=embed`; if (map.getAttribute("src") !== src) map.src = src;
  $("#contact-cards").replaceChildren(...[["العنوان", L(site, "address")], ["الهاتف", site.phone], ["البريد الإلكتروني", site.email], ["مواعيد العمل", L(site, "hours")]].filter((r) => r[1]).map(([k, v]) => { const c = el("div", "card p-5"); c.append(el("div", "kicker", tr(k)), el("p", "mt-2 text-white font-bold", v)); return c; }));
  for (const sel of ["#info-s", "#f-info"]) $(sel).replaceChildren(...[L(site, "address"), site.phone, site.email, L(site, "hours")].filter(Boolean).map((t) => el("p", "", t)));

  const tg = clean(site.telegram, 40).replace(/[^\w]/g, ""), wa = clean(site.whatsapp, 20).replace(/\D/g, "");
  ["#social", "#f-social"].forEach((sel) => $(sel).replaceChildren()); // الروابط النصية استُبدلت بالأيقونات
  for (const sel of ["#chat-s", "#chat-c", "#chat-f"]) {
    const box = $(sel); box.replaceChildren();
    for (const [label, url, cls, icon] of [
      ["واتساب", wa && `https://wa.me/${wa}`, "bg-green-600", ICONS.whatsapp], ["تلجرام", tg && `https://t.me/${tg}`, "bg-sky-600", ICONS.telegram],
      ["فيسبوك", safeUrl(site.facebook), "bg-blue-700", ICONS.facebook], ["يوتيوب", safeUrl(site.youtube), "bg-red-600", ICONS.youtube], ["إنستجرام", safeUrl(site.instagram), "bg-pink-600", ICONS.instagram]]) {
      if (!url) continue;
      const b = el("a", `${cls} text-white rounded-full w-10 h-10 inline-flex items-center justify-center hover:scale-110 transition`); b.href = url; b.target = "_blank"; b.rel = "noopener noreferrer";
      b.setAttribute("aria-label", tr(label)); b.title = tr(label); b.append(svgIcon(icon)); box.append(b);
    }
  }

  renderForms(); renderMine(); applyExtras();
}

function updateToggles() {
  const mode = document.documentElement.dataset.mode, user = auth.currentUser;
  $("#mode-btn").textContent = mode === "dark" ? "☀" : "☾"; $("#lang-btn").textContent = lang === "ar" ? "EN" : "عربي";
  $("#auth-btn").textContent = user ? `${tr("خروج")} (${(user.displayName || user.email || "").split(" ")[0]})` : tr("انضم إلينا");
}
function refresh() { renderAll(); translateStatic(); updateToggles(); }
function setLang(l) { lang = l; try { localStorage.setItem("lang", l); } catch { /* ignore */ } applyLangAttrs(); refresh(); }

function toast(text) {
  if (!text) return;
  const t = el("div", "fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded shadow", text);
  document.body.append(t); setTimeout(() => t.remove(), 4000);
}

function initVisitorAuth() { // انضم إلينا: اشتراك + دخول بحساب Gmail
  onAuthStateChanged(auth, updateToggles);
  $("#auth-btn").addEventListener("click", async () => {
    if (auth.currentUser) return signOut(auth);
    try {
      const { user } = await googleSignIn(), subscriber = doc(db, "subscribers", user.uid);
      if (!(await getDoc(subscriber)).exists()) await setDoc(subscriber, { name: clean(user.displayName, 100), email: user.email, createdAt: serverTimestamp() });
      toast(tr("تم الاشتراك وتسجيل الدخول بنجاح."));
    } catch (err) { toast(authError(err)); }
  });
}

async function loadExtras() {
  const [theme, layout, ...imgs] = await Promise.all([readDoc("theme"), readDoc("layout"), ...IMG_KEYS.map(([k]) => readDoc(`img_${k}`))]);
  let sections = [];
  try { sections = (await getDocs(query(collection(db, "sections"), orderBy("order")))).docs.map((d) => ({ id: d.id, ...d.data() })); } catch { /* ignore */ }
  return { theme, layout, imgs: Object.fromEntries(IMG_KEYS.map(([k], i) => [k, imgs[i]?.data || ""])), sections };
}

async function initSite() {
  const root = document.documentElement;
  root.dataset.mode = readJson("mode", "dark") === "light" ? "light" : "dark";
  applyLangAttrs(); applyTheme(readJson("theme"));
  addEventListener("hashchange", () => route()); route();
  $("#menu-btn").addEventListener("click", () => $("#menu-m").classList.toggle("hidden"));
  bindSwitch("mtab"); bindSwitch("ftab");
  document.querySelectorAll("[data-open]").forEach((a) => a.addEventListener("click", () => $(`.seg[data-mtab="${a.dataset.open}"]`)?.click()));
  document.querySelectorAll("[data-form-tab]").forEach((a) => a.addEventListener("click", () => $(`.seg[data-ftab="${a.dataset.formTab}"]`)?.click()));
  $("#mode-btn").addEventListener("click", () => {
    const mode = root.dataset.mode === "dark" ? "light" : "dark";
    root.dataset.mode = mode; writeJson("mode", mode); applyTheme(DATA.extra.theme || readJson("theme")); updateToggles();
  });
  $("#lang-btn").addEventListener("click", () => setLang(lang === "ar" ? "en" : "ar"));
  initVisitorAuth(); refresh();

  const [site, news, press, gallery, extra, stats] = await Promise.all([
    loadSite(), loadList("news", 12), loadList("press", 20), loadList("gallery", 24), loadExtras(),
    readDoc("stats").then((s) => s || {})
  ]);
  Object.assign(DATA, { site, news, press, gallery, extra, stats });
  if (extra.theme) writeJson("theme", extra.theme); else { try { localStorage.removeItem("theme"); } catch { /* ignore */ } }
  refresh();
}

/* ============ 7) لوحة التحكم ============ */
const T = "text", A = "area";
const SECTIONS = {
  general: { label: "عام", single: true, fields: [["topbar", "الشريط العلوي", T, 1], ["heroTitle", "عنوان البنر الرئيسي", T, 1], ["heroAccent", "الجزء الذهبي من العنوان", T, 1], ["governorTitle", "صفة السيد المحافظ", T, 1], ["governorName", "اسم السيد المحافظ", T, 1], ["chairmanName", "اسم رئيس مجلس الأمناء", T, 1], ["chairmanTitle", "صفة رئيس مجلس الأمناء", T, 1], ["copyright", "نص الفوتر (حقوق النشر)", T, 1]] },
  home: { label: "الرئيسية", single: true, fields: [["slides", "رسائل البنر المتحركة (سطر لكل رسالة: العنوان | النص)", A, 1], ["intro", "نبذة «من نحن»", A, 1], ["ctaTitle", "عنوان شريط الدعوة", T, 1], ["ctaSub", "نص شريط الدعوة", T, 1]] },
  about: { label: "عن المؤسسة", single: true, fields: [["about_title", "عنوان الصفحة", T, 1], ["about_sub", "وصف الصفحة", A, 1], ["chairmanWord", "كلمة رئيس المؤسسة", A, 1], ["vision", "الرؤية", A, 1], ["mission", "الرسالة", A, 1], ["goalsList", "الأهداف (سطر لكل هدف: العنوان | الوصف)", A, 1], ["structure", "الهيكل التنظيمي (سطر لكل جهة: العنوان | الوصف)", A, 1], ["licenseText", "نص الترخيص", A, 1], ["licenseNo", "رقم الإشهار"], ["licenseYear", "سنة الإشهار"], ["scope", "نطاق العمل", T, 1], ["hqNote", "ملاحظة المقر", A, 1], ["districts", "لجان الأحياء (سطر لكل لجنة: اسم الحي | الوصف)", A, 1]] },
  services: { label: "الخدمات", single: true, fields: [["services_title", "عنوان الصفحة", T, 1], ["services_sub", "وصف الصفحة", A, 1], ["servicesList", "الخدمات (سطر لكل خدمة: العنوان | الوصف)", A, 1], ["steps", "خطوات العمل (سطر لكل خطوة: العنوان | الوصف)", A, 1]] },
  mediaText: { label: "نصوص الإعلام", single: true, fields: [["media_title", "عنوان صفحة المركز الإعلامي", T, 1], ["media_sub", "وصف الصفحة", A, 1]] },
  contact: { label: "الاتصال والتواصل", single: true, fields: [["contact_title", "عنوان الصفحة", T, 1], ["contact_sub", "وصف الصفحة", A, 1], ["address", "العنوان", T, 1], ["phone", "الهاتف"], ["email", "البريد الإلكتروني"], ["hours", "مواعيد العمل", T, 1], ["mapQuery", "موقع الخريطة (اسم المكان أو الإحداثيات)"], ["whatsapp", "واتساب (بالصيغة الدولية بدون +)"], ["telegram", "اسم مستخدم تلجرام"], ["youtube", "رابط يوتيوب"], ["facebook", "رابط فيسبوك"], ["instagram", "رابط إنستجرام"]] },
  stats: { label: "الإحصائيات", single: true, doc: "stats", fields: [["initiatives", "مبادرات وبرامج", "num"], ["services", "خدمات مقدمة", "num"], ["beneficiaries", "مستفيدون", "num"], ["committees", "لجان أحياء", "num"]] },
  branding: { label: "الصور والشعار", custom: "branding" },
  theme: { label: "الألوان (ليلي / نهاري)", custom: "theme" },
  layout: { label: "الأقسام والتبويبات", custom: "layout" },
  sections: { label: "صفحات وأقسام مخصصة", fields: [["title", "عنوان القسم", T, 1], ["body", "المحتوى (فقرات)", A, 1], ["media", "صورة أو فيديو (اختياري)", "media"], ["place", "مكان الظهور", { select: [["tab", "صفحة مستقلة في القائمة"], ["home", "داخل الصفحة الرئيسية"]] }], ["order", "الترتيب (الأصغر أولًا)", "num"], ["visible", "الحالة", { select: [["yes", "ظاهر"], ["no", "مخفي"]] }]] },
  news: { label: "الأخبار", fields: [["title", "العنوان", T, 1], ["body", "النص", A, 1], ["media", "صور وفيديو (حتى 4)", "media4"]] },
  press: { label: "البيانات الصحفية", fields: [["title", "العنوان", T, 1], ["body", "نص البيان", A, 1], ["media", "صورة واحدة (اختياري)", "media"]] },
  gallery: { label: "الصور والفيديو", fields: [["caption", "العنوان", T, 1], ["body", "الوصف التفصيلي", A, 1], ["media", "صور وفيديو (حتى 4)", "media4"]] },
  messages: { label: "الطلبات الواردة", readonly: true },
  subscribers: { label: "المشتركون", readonly: true }
};
const expand = (fields) => fields.flatMap(([name, label, kind, bi]) => (bi ? [[name, label, kind], [`${name}_en`, `${label} — English`, kind]] : [[name, label, kind]]));
const state = { current: "general", editing: null, media: {} };

function initAdmin() {
  const say = (t, ok = true) => { const s = $("#status"); s.textContent = t; s.className = `text-sm mb-3 ${ok ? "text-green-700" : "text-red-600"}`; };
  const removeFile = async (url) => { if (/^https:\/\/firebasestorage|storage\.googleapis/i.test(url || "")) { try { await deleteObject(ref(storage, url)); } catch { /* ignore */ } } };

  /* ----- الدخول (قفل بعد 5 محاولات + خروج تلقائي بعد 15 دقيقة) ----- */
  $("#login-btn").addEventListener("click", async () => {
    const left = store.get("lockUntil") - Date.now();
    if (left > 0) return ($("#login-error").textContent = `الدخول مقفل مؤقتًا. حاول بعد ${Math.ceil(left / 60000)} دقيقة.`);
    try { await signInWithEmailAndPassword(auth, $("#email").value.trim(), $("#password").value); store.set("fails", 0); }
    catch { const f = store.get("fails") + 1; store.set("fails", f); if (f >= 5) { store.set("lockUntil", Date.now() + 5 * 60_000); store.set("fails", 0); } $("#login-error").textContent = "بيانات الدخول غير صحيحة."; }
  });
  $("#logout").addEventListener("click", () => signOut(auth));
  $("#google-btn").addEventListener("click", async () => { try { await googleSignIn(); } catch (err) { $("#login-error").textContent = authError(err); } });
  let idle; const resetIdle = () => { clearTimeout(idle); idle = setTimeout(() => signOut(auth), 15 * 60_000); };
  ["click", "keydown", "touchstart"].forEach((e) => document.addEventListener(e, resetIdle));
  onAuthStateChanged(auth, async (user) => {
    let ok = false;
    if (user) {
      try { ok = (await getDoc(doc(db, "admins", user.uid))).exists(); } catch { /* ignore */ }
      if (!ok) { $("#login-error").textContent = `هذا الحساب ليس مسؤولًا. أنشئ مستندًا في مجموعة admins معرّفه (UID): ${user.uid}`; await signOut(auth); return; }
    }
    $("#login").classList.toggle("hidden", ok); $("#panel").classList.toggle("hidden", !ok);
    if (ok) { resetIdle(); buildTabs(); show("general"); }
  });
  const buildTabs = () => $("#tabs").replaceChildren(...Object.entries(SECTIONS).map(([k, s]) => { const b = el("button", "px-4 py-2 rounded bg-white border", s.label); b.addEventListener("click", () => show(k)); return b; }));

  /* ----- النماذج العامة ----- */
  function slotPicker() { // خانة واحدة: طريقة الإضافة + ملف أو رابط
    const box = el("div", "space-y-2 border rounded p-2"), method = el("select", "field"), file = el("input"), link = el("input", "field hidden");
    [["device", "رفع من الجهاز إلى Firebase Storage (صور وفيديو)"], ["db", "رفع مضغوط داخل قاعدة البيانات (صور فقط — لا يحتاج Storage)"], ["link", "رابط خارجي (صورة / فيديو / يوتيوب)"]].forEach(([v, t]) => method.append(new Option(t, v)));
    file.type = "file"; file.accept = "image/*,video/*"; link.placeholder = "https://...";
    method.addEventListener("change", () => { file.classList.toggle("hidden", method.value === "link"); link.classList.toggle("hidden", method.value !== "link"); });
    box.append(method, file, link);
    return { box, method, file, link };
  }
  function mediaPicker(name, values) { // وسيط واحد
    const s = slotPicker(), box = el("div", "space-y-2");
    box.append(s.box);
    if (values?.url) box.append(el("p", "text-xs text-gray-500", "يوجد ملف محفوظ حاليًا — اترك الحقل فارغًا للإبقاء عليه."));
    state.media[name] = s; return box;
  }
  function mediaMulti(name, values) { // حتى 4 وسائط للعنصر الواحد
    const box = el("div", "space-y-3 border rounded p-3"), existing = [], cur = [{ url: values.url, mediaType: values.mediaType }, ...(values.more || [])].filter((m) => m.url);
    if (cur.length) {
      box.append(el("p", "text-xs text-gray-500", "الوسائط الحالية — علّم «حذف» لإزالة أي منها:"));
      const row = el("div", "flex flex-wrap gap-3");
      cur.forEach((m) => {
        const cell = el("label", "text-xs text-center space-y-1"), isImg = m.mediaType === "image" && safeUrl(m.url), t = isImg ? el("img", "h-16 w-24 object-cover rounded border") : el("div", "h-16 w-24 grid place-items-center rounded border bg-gray-100", m.mediaType || "media"), cb = el("input");
        if (isImg) t.src = m.url; cb.type = "checkbox"; cell.append(t, cb, " حذف"); existing.push({ m, cb }); row.append(cell);
      });
      box.append(row);
    }
    box.append(el("p", "text-xs text-gray-500", "أضف وسائط جديدة (الحد الأقصى للعنصر الواحد 4 صور أو فيديوهات). اترك الخانات الفارغة كما هي."));
    const slots = [0, 1, 2, 3].map((i) => { const s = slotPicker(); box.append(el("b", "block text-xs mt-1", `وسيط جديد ${i + 1}`), s.box); return s; });
    state.media[name] = { existing, slots }; return box;
  }
  function renderForm(values = {}) {
    const sec = SECTIONS[state.current], form = $("#form");
    form.replaceChildren(); state.media = {};
    if (sec.readonly || sec.custom) return;
    for (const [name, label, kind] of expand(sec.fields)) {
      const wrap = el("label", "block text-sm", label);
      let input;
      if (kind === "media" || kind === "media4") { wrap.append(kind === "media4" ? mediaMulti(name, values) : mediaPicker(name, values)); form.append(wrap); continue; }
      if (kind?.select) { input = el("select", "field"); kind.select.forEach(([v, t]) => input.append(new Option(t, v))); input.value = values[name] ?? kind.select[0][0]; }
      else { input = el(kind === A ? "textarea" : "input", "field"); if (kind === A) input.rows = 5; if (kind === "num") input.type = "number"; input.value = values[name] ?? ""; }
      input.name = name; wrap.append(input); form.append(wrap);
    }
    const save = el("button", "btn btn-gold", sec.single ? "حفظ" : state.editing ? "حفظ التعديل" : "نشر"); save.type = "submit"; form.append(save);
  }
  async function show(key) {
    state.current = key; state.editing = null; say("");
    const sec = SECTIONS[key]; $("#list").replaceChildren(); $("#form").replaceChildren();
    if (sec.custom) return CUSTOM[sec.custom]();
    let values = {};
    if (sec.single) values = { ...(sec.doc ? {} : DEFAULTS), ...((await readDoc(sec.doc || "site")) || {}) };
    renderForm(values);
    if (!sec.single) await renderList(key);
  }

  /* ----- القائمة: تعديل / حذف / معالجة ----- */
  async function renderList(key) {
    const snap = await getDocs(query(collection(db, key), orderBy("createdAt", "desc"))), list = $("#list");
    if (!snap.size) return list.append(el("li", "py-3 text-gray-500", "لا توجد عناصر بعد."));
    const TYPES_AR = { consultation: "استشارة", complaint: "شكوى/مقترح", membership: "عضوية/تطوع", contact: "رسالة" };
    snap.forEach((d) => {
      const x = d.data(), li = el("li", "py-3 flex justify-between gap-3 items-start"), info = el("div", "text-sm space-y-1 flex-1"), actions = el("div", "flex gap-3 text-sm shrink-0");
      const head = key === "messages" ? `${TYPES_AR[x.type] || x.type} — ${x.name} (${x.phone})` : key === "subscribers" ? `${x.name} — ${x.email}` : (x.title || x.caption || "—");
      info.append(el("b", "", head), el("p", "text-gray-600 whitespace-pre-line", [x.kind, x.district, x.body, x.message].filter(Boolean).join(" — ")), el("p", "text-xs text-gray-400", `${fmtDate(x.createdAt)}${x.mediaType ? ` — ${x.mediaType}${x.more?.length ? ` +${x.more.length}` : ""}` : ""}`));
      if (key !== "messages" && key !== "subscribers" && x.mediaType === "image" && safeUrl(x.url)) { const t = el("img", "h-12 w-16 object-cover rounded"); t.src = x.url; li.append(t); }
      if (key === "messages") {
        const done = x.status === "done", t = el("button", done ? "text-gray-500" : "text-green-700", done ? "إعادة فتح" : "تمت المعالجة");
        t.addEventListener("click", async () => { await updateDoc(doc(db, key, d.id), { status: done ? "new" : "done" }); show(key); }); actions.append(t);
      } else if (!SECTIONS[key].readonly) {
        const e = el("button", "text-blue-700", "تعديل"); e.addEventListener("click", () => { state.editing = { id: d.id, data: x }; renderForm(x); scrollTo({ top: 0 }); }); actions.append(e);
      }
      const del = el("button", "text-red-600", "حذف");
      del.addEventListener("click", async () => { if (!confirm("تأكيد الحذف؟")) return; await removeFile(x.url || x.imageUrl); await deleteDoc(doc(db, key, d.id)); show(key); });
      actions.append(del); li.append(info, actions); list.append(li);
    });
  }

  /* ----- الرفع بثلاث طرق ----- */
  async function upload(file, folder) {
    if (!/^(image|video)\//.test(file.type)) throw new Error("نوع الملف غير مسموح (صور وفيديو فقط).");
    if (file.size > 50 * 1024 * 1024) throw new Error("حجم الملف أكبر من 50 ميجابايت.");
    const r = ref(storage, `${folder}/${crypto.randomUUID()}_${file.name.replace(/[^\w.-]/g, "_")}`);
    await uploadBytes(r, file); return getDownloadURL(r);
  }
  async function readMedia(m, folder, maxLen) {
    const method = m.method.value;
    if (method === "link") {
      const u = clean(m.link.value, 500); if (!u) return null;
      if (!/^https:\/\//i.test(u)) throw new Error("الرابط يجب أن يبدأ بـ https://");
      return { url: u, mediaType: ytId(u) ? "youtube" : /\.(mp4|webm|ogg)(\?|$)/i.test(u) ? "video" : "image" };
    }
    const f = m.file.files[0]; if (!f) return null;
    if (method === "db") { if (!f.type.startsWith("image/")) throw new Error("هذه الطريقة للصور فقط. للفيديو استخدم الرفع من الجهاز أو الرابط."); return { url: await toDataUrl(f, 1200, 0.78, maxLen), mediaType: "image" }; }
    say("جارٍ رفع الملف..."); return { url: await upload(f, folder), mediaType: f.type.startsWith("video/") ? "video" : "image" };
  }

  $("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = state.current, sec = SECTIONS[key], form = e.currentTarget, data = {}, btn = form.querySelector("button");
    if (sec.custom || sec.readonly) return;
    btn.disabled = true;
    const pendingRemove = [];
    try {
      for (const [name, , kind] of expand(sec.fields)) {
        if (kind === "media4") {
          const ms = state.media[name], kept = ms.existing.filter((x) => !x.cb.checked).map((x) => x.m);
          ms.existing.filter((x) => x.cb.checked).forEach((x) => pendingRemove.push(x.m.url));
          const newDb = ms.slots.filter((s) => s.method.value === "db" && s.file.files[0]).length, keptLen = kept.reduce((n, m) => n + (m.url.startsWith("data:") ? m.url.length : 0), 0);
          const budget = Math.max(120_000, Math.floor((850_000 - keptLen) / Math.max(1, newDb))), added = [];
          for (const s of ms.slots) { const v = await readMedia(s, key, budget); if (v) added.push(v); }
          const all = [...kept, ...added];
          if (all.length > 4) throw new Error("الحد الأقصى 4 وسائط للعنصر الواحد — علّم بعضها «حذف» أولًا.");
          data.url = all[0]?.url || ""; data.mediaType = all[0]?.mediaType || ""; data.more = all.slice(1).map((m) => ({ url: m.url, mediaType: m.mediaType }));
          continue;
        }
        if (kind === "media") {
          const v = await readMedia(state.media[name], key);
          if (v) { await removeFile(state.editing?.data.url || state.editing?.data.imageUrl); Object.assign(data, v); }
          continue;
        }
        const input = form.elements[name];
        data[name] = kind === "num" ? Number(input.value || 0) : clean(input.value, kind === A ? 5000 : 300);
      }
      if (sec.single) await setDoc(doc(db, "settings", sec.doc || "site"), data, { merge: true });
      else if (state.editing) await updateDoc(doc(db, key, state.editing.id), { ...data, updatedAt: serverTimestamp() });
      else { if (key === "gallery" && !data.url) throw new Error("أضف صورة أو فيديو أولًا."); await addDoc(collection(db, key), { ...data, createdAt: serverTimestamp() }); }
      for (const u of pendingRemove) await removeFile(u);
      if (!sec.single) await show(key);
      say("تم الحفظ بنجاح");
    } catch (err) { say(err.message || "حدث خطأ", false); }
    finally { btn.disabled = false; }
  });

  /* ----- واجهات مخصصة: الصور / الألوان / الأقسام ----- */
  const btnEl = (cls, text, fn) => { const b = el("button", cls, text); b.type = "button"; b.addEventListener("click", fn); return b; };
  const CUSTOM = {
    async branding() {
      const form = $("#form");
      form.append(el("p", "text-sm text-gray-600", "ارفع صورة جديدة لتظهر في الموقع فورًا، أو استعد الصورة الافتراضية. تُضغط الصور تلقائيًا وتُحفظ داخل قاعدة البيانات."));
      for (const [key, label, maxW, quality] of IMG_KEYS) {
        const row = el("div", "border rounded p-3 flex flex-wrap items-center gap-3"), cur = await readDoc(`img_${key}`), file = el("input");
        const preview = el("img", "h-16 w-24 object-cover rounded border bg-gray-100"); preview.src = cur?.data || DEFAULT_IMG[key]; preview.alt = label;
        file.type = "file"; file.accept = "image/*";
        row.append(preview, el("b", "text-sm w-52", label), file,
          btnEl("btn btn-gold text-sm", "رفع وحفظ", async () => { try { if (!file.files[0]) throw new Error("اختر صورة أولًا."); say("جارٍ المعالجة..."); const data = await toDataUrl(file.files[0], maxW, quality); await setDoc(doc(db, "settings", `img_${key}`), { data }); preview.src = data; say("تم تحديث الصورة"); } catch (err) { say(err.message, false); } }),
          btnEl("text-sm text-red-600 underline", "استعادة الافتراضي", async () => { await deleteDoc(doc(db, "settings", `img_${key}`)); preview.src = DEFAULT_IMG[key]; say("تمت استعادة الصورة الافتراضية"); }));
        form.append(row);
      }
    },
    async theme() {
      const form = $("#form"), saved = (await readDoc("theme")) || {}, all = {};
      form.append(el("p", "text-sm text-gray-600", "عدّل ألوان الوضعين. الزائر يبدّل بينهما بزر ☀ / ☾ في الموقع."));
      for (const mode of ["dark", "light"]) {
        const box = el("div", "border rounded p-4 space-y-3"), grid = el("div", "grid sm:grid-cols-2 gap-3"), inputs = {};
        box.append(el("b", "", mode === "dark" ? "الوضع الليلي" : "الوضع النهاري"));
        for (const [k, label] of THEME_FIELDS) { const lab = el("label", "flex items-center gap-3 text-sm"), i = el("input", "h-9 w-14 shrink-0"); i.type = "color"; i.value = saved[mode]?.[k] || BASE[mode][k]; inputs[k] = i; lab.append(i, label); grid.append(lab); }
        const prev = el("div", "rounded p-4 text-sm"), title = el("b", "", "عنوان القسم"), card = el("div", "rounded p-3 mt-2", "بطاقة محتوى"), btn = el("span", "inline-block rounded px-3 py-1 mt-2 font-bold", "زر");
        prev.append(title, card, btn);
        const paint = () => { const v = (k) => inputs[k].value; prev.style.background = v("bg"); prev.style.color = v("text"); card.style.background = v("card"); card.style.border = `1px solid ${v("gold")}`; title.style.color = v("gold2"); btn.style.background = v("gold"); btn.style.color = v("onGold"); };
        grid.addEventListener("input", paint); paint();
        box.append(grid, prev, btnEl("text-sm underline text-red-600", "استعادة ألوان هذا الوضع", () => { THEME_FIELDS.forEach(([k]) => { inputs[k].value = BASE[mode][k]; }); paint(); }));
        form.append(box); all[mode] = inputs;
      }
      form.append(btnEl("btn btn-gold", "حفظ الألوان", async () => { const read = (m) => Object.fromEntries(Object.entries(all[m]).map(([k, i]) => [k, i.value])); await setDoc(doc(db, "settings", "theme"), { dark: read("dark"), light: read("light") }); say("تم حفظ الألوان"); }),
        btnEl("text-sm underline text-red-600 mx-4", "حذف التخصيص كله", async () => { await deleteDoc(doc(db, "settings", "theme")); say("عاد الموقع للألوان الافتراضية"); show("theme"); }));
    },
    async layout() {
      const form = $("#form"), saved = (await readDoc("layout")) || {}, hidden = new Set(saved.hidden || []), labels = saved.labels || {};
      const row = (id, label, tabKey) => {
        const r = el("div", "flex flex-wrap items-center gap-3 border rounded p-3 text-sm"), cb = el("input"); cb.type = "checkbox"; cb.checked = !hidden.has(id); cb.dataset.id = id;
        r.append(cb, el("span", "w-56", label));
        if (tabKey) for (const [suffix, ph] of [["", "اسم التبويب (عربي)"], ["_en", "Tab name (English)"]]) { const i = el("input", "field w-48"); i.placeholder = ph; i.value = labels[tabKey + suffix] || ""; i.dataset.label = tabKey + suffix; r.append(i); }
        return r;
      };
      form.append(el("b", "", "كتل الصفحة الرئيسية (أزل العلامة للإخفاء)"), ...BLOCKS.map(([id, l]) => row(id, l)), el("b", "block mt-3", "التبويبات (إخفاء أو إعادة تسمية)"), ...TABS.map(([id, l]) => row(`tab:${id}`, l, id)),
        btnEl("btn btn-gold", "حفظ", async () => {
          const h = [...form.querySelectorAll("input[type=checkbox]")].filter((c) => !c.checked).map((c) => c.dataset.id), lb = {};
          form.querySelectorAll("input[data-label]").forEach((i) => { if (i.value.trim()) lb[i.dataset.label] = clean(i.value, 40); });
          await setDoc(doc(db, "settings", "layout"), { hidden: h, labels: lb }); say("تم حفظ إعدادات الأقسام");
        }));
    }
  };
}

document.body.id === "admin" ? initAdmin() : initSite();
