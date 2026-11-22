import { createHash } from "crypto";
import { db } from "@/db";
import {
  admins,
  categories,
  products,
  reviews,
  settings,
  type Category,
  type Product,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export const OWNER_EMAIL = "abdeenali520@gmail.com";
export const OWNER_DEFAULT_PASSWORD = "abdeen2024";
export const ALL_PERMISSIONS = [
  "dashboard",
  "products",
  "orders",
  "reviews",
  "categories",
  "settings",
];

let seeding: Promise<void> | null = null;

/** Idempotent seeder — safe to call on any server render. */
export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = runSeed().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}

const px = (id: number, w = 900, h = 1125) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=${w}&h=${h}&fit=crop`;

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);

type SeedCategory = Omit<Category, "id">;

const SEED_CATEGORIES: SeedCategory[] = [
  { name: "عبايات وأزياء نسائية", slug: "womens", image: px(32178223, 600, 600), sortOrder: 1, active: true },
  { name: "أزياء رجالية", slug: "mens", image: px(28938765, 600, 600), sortOrder: 2, active: true },
  { name: "عطور وعبقانات", slug: "perfumes", image: px(37127787, 600, 600), sortOrder: 3, active: true },
  { name: "ساعات وزينة", slug: "watches", image: px(9142237, 600, 600), sortOrder: 4, active: true },
  { name: "حقائب وإكسسوارات", slug: "bags", image: px(10919291, 600, 600), sortOrder: 5, active: true },
  { name: "إلكترونيات", slug: "electronics", image: px(7772548, 600, 600), sortOrder: 6, active: true },
  { name: "العناية والجمال", slug: "beauty", image: px(32291052, 600, 600), sortOrder: 7, active: true },
  { name: "المنزل والمطبخ", slug: "home", image: px(6907917, 600, 600), sortOrder: 8, active: true },
];

type SeedProduct = Omit<Product, "id">;

const P = (
  name: string,
  slug: string,
  description: string,
  categorySlug: string,
  price: number,
  oldPrice: number | null,
  stock: number,
  images: string[],
  sizes: string[],
  colors: string[],
  badge: string | null,
  featured: boolean,
  sales: number,
  createdDaysAgo: number
): SeedProduct => ({
  name,
  slug,
  description,
  categorySlug,
  price,
  oldPrice,
  stock,
  images,
  sizes,
  colors,
  badge,
  featured,
  active: true,
  sales,
  videoUrl: null,
  deliveryDays: null,
  source: "stock",
  createdAt: daysAgo(createdDaysAgo),
});

const SEED_PRODUCTS: SeedProduct[] = [
  P('عباية كريب "نور" فاخرة', "abaya-kreep-nour",
    "عباية كريب فاخرة بقصّة انسيابية تمنحك إطلالة راقية في كل مناسباتك. خامة مريحة لا تتجعد، تطريز يدوي دقيق عند الأكمام، وأكمام واسعة عملية تناسب الحركة اليومية. متوفرة بألوان أساسية تناسب جميع الإطلالات، وتُغسل يدويًا أو على دورة ناعمة للحفاظ على نعومتها.",
    "womens", 890, 1290, 34,
    [px(32178223), px(4387670), px(33448124)],
    ["S", "M", "L", "XL", "XXL"], ["أسود", "عاجي", "كحلي"],
    "الأكثر مبيعاً", true, 214, 42),
  P("فستان صيفي مطرز", "summer-dress-embroidered",
    "فستان صيفي بخامة قطنية خفيفة تسمح بمرور الهواء، مع تطريز يدوي ناعم عند الصدر. قصّة واسعة مريحة ومثالية ليوم طويل، ويمكن إرفاق حزام خصر اختياري لتعريف القوام. اللون طبيعي يدوم مع الغسيل المتكرر.",
    "womens", 640, null, 21,
    [px(35324616), px(38879792)],
    ["S", "M", "L"], ["بيج", "رملي"],
    "جديد", false, 96, 6),
  P('بلوزة شيفون "ريم"', "chiffon-bloom-rem",
    "بلوزة شيفون بطبقة داخلية مريحة، أكمام بوف أنيقة وأزرار لاميه. قطعة أساسية تُلبس مع السروال أو الجينز وتمنحك مظهرًا ناعمًا في العمل والمناسبات.",
    "womens", 320, 450, 48,
    [px(34957209), px(33271829)],
    ["S", "M", "L", "XL"], ["بنفسجي", "أبيض", "أزرق فاتح"],
    null, false, 133, 24),
  P("حجاب قطيفة تركية", "turkish-velvet-hijab",
    "قطيفة تركية مستوردة بنعومة فائقة وثبات ممتاز بدون حديد. لون غني لا يبهت مع الغسيل، ومقاس مريح يثبّت بدون إكسسوارات. خيارك اليومي الأنسب.",
    "womens", 95, 140, 120,
    [px(35324620), px(34957209)],
    ["مقاس واحد"], ["سودا", "بني داكن", "زيتي", "كحلي"],
    null, false, 388, 30),
  P('قميص كتان "فارس"', "linen-shirt-fares",
    "قميص كتان 100% بخامة تسمح بتهوية ممتازة في أيام الصيف الحارة. قصّة Regular مريحة، أكمام قابلة للطي، وألوان ترابية هادئة تناسب كل خزانة رجالية.",
    "mens", 480, 650, 40,
    [px(14941607), px(17275806)],
    ["M", "L", "XL", "XXL"], ["كحلي", "بيج", "أخضر زيتي"],
    "جديد", false, 154, 9),
  P("جاكيت جينز كلاسيك", "classic-denim-jacket",
    "جاكيت جينز بقصّة كلاسيكية وخامة دنيم متين لا يفقد لونه مع الاستخدام. جيبان أماميان وجيب صدري، مثالي كطبقة خارجية في الفصول الانتقالية.",
    "mens", 820, 1100, 18,
    [px(28938765), px(29585150)],
    ["M", "L", "XL"], ["أزرق جينز", "أسود"],
    null, false, 98, 28),
  P("طقم تيشيرت كاجوال (3 قطع)", "casual-tshirt-3pack",
    "تيشيرت قطن قمبري بوزن 180 جم، لا ينكمش بعد الغسيل ويحافظ على شكله. عبوة 3 قطع بألوان محايدة تُلبس يوميًا مع أي بنطلون.",
    "mens", 350, null, 90,
    [px(29585150), px(10618446)],
    ["M", "L", "XL"], ["أسود", "أبيض", "رمادي"],
    null, false, 260, 18),
  P('ساعة يد "أورين" جلد', "leather-watch-orein",
    "ساعة أنيقة بسوار جلد إيطالي مبطن وساعة كوارتز يابانية دقيقة. قرص 40 مم بخامات مقاومة للصدأ، وسوار قابل للاستبدال. صنية أنيقة تضفي عليها لمسة هدية فاخرة.",
    "watches", 1950, 2500, 12,
    [px(28947727), px(17275806)],
    ["مقاس واحد"], ["بني", "أسود"],
    null, true, 87, 15),
  P('ساعة رقمية "ليل"', "digital-watch-layl",
    "ساعة رياضية رقمية بشاشة عالية الوضوح، مقاومة للماء حتى 30 مترًا، ومزودة بمؤقت وساعة إيقاف. بطارية تدوم حتى سنة كاملة.",
    "watches", 740, 990, 26,
    [px(9142237), px(13007642), px(14979022)],
    ["مقاس واحد"], ["رمادي", "أسود"],
    null, false, 121, 21),
  P('عطر "مسك الليل" رجالي 100 مل', "perfume-misk-layl",
    "عطر شرقي خشبي بفتحة من البرغموت والجلد، قلب من المسك الأبيض والتوابل، وقاعدة من العود والفانيليا. ثبات يتجاوز 10 ساعات ونفحَة قوية تترك أثرًا. تركيز Eau de Parfum.",
    "perfumes", 1250, 1600, 28,
    [px(15096784), px(36779953), px(29611647)],
    ["100 مل"], ["أسود ذهبي"],
    "الأكثر مبيعاً", true, 176, 35),
  P('عطر "ياسمين العود" نسائي', "perfume-yasmin-oud",
    "مزيج راقٍ بين نضارة الياسمين الأبيض ودفء العود الكمبودي، يفتتح بالليمون والفلفل الوردي ويغلق بالصندل والهيل. خيار مثالي للمناسبات والسهرات.",
    "perfumes", 1580, 1980, 22,
    [px(37127787), px(7703038), px(11711833)],
    ["90 مل"], ["ذهبي"],
    "الأكثر مبيعاً", true, 143, 27),
  P("سماعات بلوتوث E8 Pro", "bluetooth-headphones-e8",
    "سماعة رأس لاسلكية بعزل ضوضاء نشط، 40 ساعة تشغيل بشحنة واحدة، وبلوتوث 5.3 باتصال مستقر. وسائد أذن مبطنة للارتداء الطويل، وميكروفون مدمج لاتصالات واضحة.",
    "electronics", 899, 1350, 55,
    [px(7772548), px(3394666), px(3394656)],
    ["مقاس واحد"], ["أسود", "أبيض"],
    "خصم", true, 342, 12),
  P("ساعة ذكية Fit S9", "smartwatch-fit-s9",
    "ساعة ذكية بشاشة أموليد 1.8 بوصة، تتبع للنبض والأكسجين والنوم، أكثر من 100 وضع رياضي، وإشعارات مكالمة ورسائل. مقاومة للماء وبطارية تدوم 7 أيام.",
    "electronics", 1450, 1900, 38,
    [px(13007642), px(14979022), px(19961773)],
    ["مقاس واحد"], ["أسود", "أبيض"],
    "الأكثر مبيعاً", false, 254, 8),
  P("شاحن لاسلكي ثلاثي 3في1", "wireless-charger-3in1",
    "محطة شحن لاسلكية لشاحن هاتف وسماعة وساعة معًا. شحن سريع 15 واط، تصميم أنيق يوازن على المكتب، وكابل Type-C في الصندوق.",
    "electronics", 520, 700, 44,
    [px(577768), px(3081173)],
    ["مقاس واحد"], ["أسود"],
    null, false, 112, 17),
  P("سيروم فيتامين سي 30 مل", "vitamin-c-serum",
    "سيروم مركّز بـ 10% فيتامين سي مستقر وماء الورد، يوحّد لون البشرة ويزيد التوهج من أول أسبوعين. خالٍ من العطر والبارابين ومناسب للبشرة الحساسة.",
    "beauty", 420, 560, 60,
    [px(32291052), px(7321710), px(16233812)],
    ["30 مل"], ["شفاف"],
    "جديد", false, 189, 5),
  P("كريم ليلي مرطّب", "night-repair-cream",
    "كريم ليلي بخلاصة الزهرة والسكوالان، يرمم البشرة أثناء النوم ويتركها ناعمة في الصباح. قوام غني يمتص بسرعة دون آثار دهنية.",
    "beauty", 380, null, 72,
    [px(8131568), px(20171275)],
    ["50 مل"], ["شفاف"],
    null, false, 104, 22),
  P('حافظة جلد "ميلانو" إيطالي', "leather-wallet-milano",
    "حافظة جلد إيطالي حقيقي بخياطة يدوية متينة، 8 جيوب للبطاقات وجيبان نقدي، بطانة قطنية ناعمة. صنية هدية أنيقة تناسب مناسبات الاختيار.",
    "bags", 1150, 1500, 16,
    [px(10919291), px(27174573)],
    ["مقاس واحد"], ["بني", "أسود"],
    null, true, 132, 29),
  P("حقيبة كتف أنيقة", "elegant-shoulder-bag",
    "حقيبة كتف بخامة جلد فاخرة بدون لمعة، سوار قابل للتعديل والطول، وجيوب داخلية مبطنة. تتّسع للتابلت والمجوهرات، وتُلبس مع كل الإطلالات.",
    "bags", 690, 950, 33,
    [px(27046143), px(7953286), px(27204287)],
    ["مقاس واحد"], ["بني", "أسود", "بيج"],
    null, false, 167, 14),
  P("نظارة شمس \"غروب\"", "sunglasses-gorob",
    "نظارة شمس بإطار أسيتال خفيف وعدسات محمية من الأشعة UV400. تصميم كلاسيكي يناسب مختلف أشكال الوجه، مع صندوق وقماشة تنظيف في الصنية.",
    "bags", 340, 480, 50,
    [px(27353350), px(25094020), "https://images.pexels.com/photos/20689005/pexels-photo-20689005.png?auto=compress&cs=tinysrgb&dpr=2&w=900&h=1125&fit=crop"],
    ["مقاس واحد"], ["أسود", "بني"],
    "جديد", false, 205, 7),
  P("طقم فناجين قهوة مرسومة يدويًا (6 قطع)", "hand-painted-cups-6pcs",
    "طقم 6 فناجين مع أطباق من البورسلين المرسوم يدويًا، كل قطعة تحمل تصميمًا فريدًا لا يتكرر. خامة بورسلين متينة آمنة للميكروويف والغسالة.",
    "home", 720, 940, 25,
    [px(39060114), px(30684175), px(16627278)],
    ["مقاس واحد"], ["أبيض مرسوم"],
    null, false, 76, 19),
  P("طقم شموع عطور (4 قطع)", "scented-candles-4pack",
    "شموع صويا طبيعية بأربعة عطور: خشب الصندل، الفانيليا، اللافندر، والعنبر. احتراق نظيف حتى 25 ساعة للشمعة، وتغليف أنيق يجعلها هدية مثالية.",
    "home", 380, 520, 65,
    [px(22863114), px(1652298), px(6715296)],
    ["مقاس واحد"], ["متعدد"],
    null, false, 91, 11),
  P("لمبة إضاءة جدارية \"دنيا\"", "wall-lamp-dunya",
    "لمبة جدارية بتصميم ديكوري يجمع بين البساطة والدفء، جسم معدني مطفي وفتحة ضوء ناعمة. مثالية للممرات وغرف النوم، وتشمل سوكيت وإضاءة LED موفرة.",
    "home", 990, 1350, 14,
    [px(6907917), px(16805389), px(29708134)],
    ["مقاس واحد"], ["ذهبي", "أسود"],
    null, false, 44, 3),
];

type SeedReview = {
  productSlug: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  days: number;
};

const R = (
  productSlug: string,
  name: string,
  rating: number,
  title: string,
  body: string,
  days: number
): SeedReview => ({ productSlug, name, rating, title, body, days });

const SEED_REVIEWS: SeedReview[] = [
  R("abaya-kreep-nour", "مريم إبراهيم", 5, "أجمل عباية اقتنيتها", "القماش فاخر والقصّة ممتازة، وصلت قبل الموعد بيوم. أنصح فيها بشدة", 2),
  R("abaya-kreep-nour", "سارة عبد الله", 5, "جودة تستاهل", "تفصيل ناعم جدًا والتطريز عباية. لبستها في مناسبة ويا ريت الكل شافها", 9),
  R("abaya-kreep-nour", "هبة محمد", 4, "مريحة جدًا", "المقاس مضبوط وخفيفة، بس أتمنى يتوفر لون أوفر", 16),
  R("summer-dress-embroidered", "نور عادل", 5, "قماش يتنفس", "الفستان خفيف جدًا في الحر والتطريز حلو. غسيل عادية من غير ما يغير شكله", 4),
  R("chiffon-bloom-rem", "شيماء حسن", 4, "كويسة جدًا", "اللون حلو بس الأكمام ممكن تكون أطول شوية. عباية كويسة", 12),
  R("chiffon-bloom-rem", "رنا فتحي", 5, "مثالية للعمل", "ألبسها كل يوم شغل، خامة مريحة ومظهر راقٍ", 20),
  R("turkish-velvet-hijab", "دعاء سمير", 5, "أفضل قطيفة جربتها", "اللون ثابت من غير حديد وثابتة بدون إكسسوارات. عباية", 7),
  R("linen-shirt-fares", "أحمد سامي", 5, "خامة ممتازة", "الكتان طبيعي فعلًا وقصته عباية. اللون الكحلي أجمل من الصور", 5),
  R("linen-shirt-fares", "كريم مصطفى", 4, "مريح جدًا", "تهوية ممتازة في الحر، بس القماشة تنجع بسرعة شوية", 11),
  R("classic-denim-jacket", "عمر شوقي", 5, "مكسوطة", "الدنيم متين والقصة رجالية حية. سعرها ممتاز مقابل الجودة", 18),
  R("casual-tshirt-3pack", "يوسف عادل", 5, "ثلاثية تستاهل", "القطن سميك ومن غير ما ينكمش بعد الغسيل. عبّارة جدًا", 8),
  R("leather-watch-orein", "طارق منصور", 5, "هدية مثالية", "اشتريتها لوالدي وأحبها جدًا. الجلد ناعم والصندوق أنيق", 6),
  R("digital-watch-layl", "محمود رمضان", 4, "عادية جدًا", "الشاشة واضحة والسوار مريح، بس الإشعارات بتأخر شوية", 13),
  R("perfume-misk-layl", "حسن عبد الرحمن", 5, "ثبات أسطوري", "العطر بيفضل في الجو من الصبح لآخر يوم. العود متوازن ومفيش زى", 3),
  R("perfume-misk-layl", "شريف لطفي", 5, "أفضل من كثر حاجة أغلى", "الفنتة خفيفة والقلب خشبي قوي. ناس كتير بتسأل عن العطر", 10),
  R("perfume-misk-layl", "معتز فؤاد", 4, "كويس للسهرات", "ثباته حلو لكن نفحته قوية شوية في البداية، بتهدأ بعد ساعة", 21),
  R("perfume-yasmin-oud", "لينا الشريف", 5, "عبقانة جدًا", "الياسمين واضح من غير ما يكون مزعج، مثالي للديس", 5),
  R("perfume-yasmin-oud", "فاطمة يوسف", 4, "حلو بس غالي شوية", "العطر ممتاز بس تمنيت كان فيه حجم أصغر بسعر أقل", 15),
  R("bluetooth-headphones-e8", "إسلام عبد التواب", 5, "أفضل سماعة في السعر ده", "عزل الضوضاء ممتاز والبطارية فعلًا ماشية 3 أيام. مكروية جدًا", 1),
  R("bluetooth-headphones-e8", "منى الله حسن", 5, "استغني بها عن سماعة أغلى", "الصوت نظيف والاتصال ثابت، الوسائد مريحة في الساعات الطويلة", 6),
  R("smartwatch-fit-s9", "زياد محمود", 5, "دقيقة جدًا", "قياسات النوم والنبض مطابقة لحد كبير. الشاشة حية جدًا في الشمس", 9),
  R("smartwatch-fit-s9", "حسام الجندي", 4, "مكسوطة جدًا", "تتصل بكل التطبيقات، بس أتمنى كان فيه ساعة أوفر في الصندوق", 14),
  R("vitamin-c-serum", "ندى كامل", 5, "فرق واضح", "بعد أسبوعين البشرة صارت أفتح وأنعم. مفيش أي تحسس", 3),
  R("vitamin-c-serum", "إسراء نبيل", 4, "حلو للبشرة الحساسة", "من غير عطر وبتشرب بسرعة. مستمرة عليه", 10),
  R("leather-wallet-milano", "وليد سعيد", 5, "جلد حقيقي فعلًا", "الخياطة ممتازة والجلد له رائحة فاخرة. وصلها كهدية لأبوي", 7),
  R("elegant-shoulder-bag", "أسماء جمال", 5, "شكلها أجمل من الصور", "الجلد ناعم والسوار قابل للتعديل. بتلف مع كل حاجة", 4),
  R("sunglasses-gorob", "ريم أشرف", 5, "خفيفة ومريحة", "الإطار خفيف جدًا والعدسات محمية. مكروية جدًا", 6),
  R("hand-painted-cups-6pcs", "منى عبد الجواد", 5, "كل قطعة فريدة", "الرسومات حلوة فعلًا ومختلفة. استخدمها كل يوم", 12),
  R("scented-candles-4pack", "سلمى فريد", 4, "ريحة هادية", "الشموع نضيفة والريحة بتفضل في الأوضة فترة. عباية", 8),
  R("wall-lamp-dunya", "باسل فتحي", 5, "أنيقة جدًا", "التركيب سهل والضوء دافئ. غرفت صارت شكلها تاني", 2),
  R("summer-dress-embroidered", "هبة محمد", 5, "مقاس مظبوط", "الفستان مضبوط على المقاس والخامة مريحة", 17),
  R("wireless-charger-3in1", "مروان أشرف", 4, "عملي جدًا", "شاحن سريع وحجمه مضبوط على المكتب. مكروية", 19),
  R("night-repair-cream", "جنى مصطفى", 5, "بشرة حية", "في الصبح البشرة تكون ناعمة فعلًا. عباية ألبس كل ليلة", 23),
  R("digital-watch-layl", "آدم حسام", 5, "سعرها كويس جدًا", "أداء ممتاز مقابل السعر. الشارح مريح", 25),
  R("classic-denim-jacket", "كريم مصطفى", 5, "كلاسيكية فعلًا", "الدنيم قوي والقصة مضبوطة. مكروية في السعر", 27),
];

const SEED_SETTINGS: Record<string, string> = {
  storeName: "عابدين",
  storeTagline: "ONLINE STORE",
  ticker: JSON.stringify([
    "أهلاً بكم في متجر عابدين — تسوّق وكأّنت على الأرض",
    "توصيل مجاني للطلبات فوق 1,000 ج.م",
    "خصومات تصل إلى 40% على تشكيلات مختارة",
    "الدفع عند الاستلام متاح في جميع المحافظات",
    "وصل جديد للتشكيلة هذا الأسبوع",
  ]),
  heroKicker: "وصلت تشكيلة 2026",
  heroTitle: "تسوّق وكأّنت على الأرض",
  heroSubtitle:
    "مع عابدين، نختار لك قطعًا راقية وأصالة موثوقة في الأزياء والإلكترونيات والمنزل — تصلك حتى باب بيتك في أي مكان على مستوى الجمهورية.",
  heroCta: "تسوّق الآن",
  heroCtaSecondary: "شاهد العروض",
  whatsapp: "01021776980",
  phone: "01021776980",
  email: "abdeen.store@gmail.com",
  address: "الأسويس — مصر",
  freeShippingOver: "1000",
  shippingFee: "50",
  currency: "ج.م",
  paymentNote: "الدفع: فودافون كاش أو الدفع عند الاستلام",
  aboutText:
    "عابدين متجر مصري يجمع بين الأناقة والموثوقية — نختار كل قطعة بعناية لنصل بها إليك في أفضل حال.",
  adminEmail: OWNER_EMAIL,
  secCode1: "2468",
  secCode2: "1357",
  secCode3: "8090",
  googleClientId: "",
  socialFacebook: "https://www.facebook.com/share/1JdCm2pCsT/",
  socialInstagram: "https://www.instagram.com/wadi_almadinah",
  socialYoutube: "https://www.youtube.com/@abdeen-store",
  socialTelegram: "https://t.me/abdeen_store",
  freeShippingEnabled: "yes",
  heroBg: "",
  heroBgMotion: "static",
  shopBg: "",
  shopBgMotion: "static",
  cartBg: "",
  siteBg: "",
  bannerImage: "/images/banner.jpg",
  bannerTitle: "هدية تعبر عنك — تغليف أنيق ووصول سريع",
  bannerSubtitle:
    "اختر، ونجهّزها في صنية هدية فاخرة باسمك. مثالية للمناسبات، ولأول مرة هتوصل قبل موعدها.",
  bannerCta: "ابدأ الهدايا",
  bannerLink: "/shop?cat=watches",
  showCollections: "yes",
  showDeals: "yes",
  showBest: "yes",
  showValues: "yes",
  showTestimonials: "yes",
  showBanner: "yes",
  showFaq: "yes",
  heroImage: "/images/hero.jpg",
  heroStat1: "+12K",
  heroStat2: "4.6/5",
  heroStat3: "27",
  heroBadge: "-40%",
  workingHours: "السبت – الخميس: 9 ص – 12 م\nالجمعة: 2 م – 12 م",
  emailProvider: "none",
  emailApiKey: "",
  emailFrom: "عابدين <abdeen@abdeen.store>",
  firebaseProject: "",
  paMailUrl: "",
  paMailKey: "",
};

async function runSeed() {
  const [countRow] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(products);
  if ((countRow?.n ?? 0) === 0) {

  const [catCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(categories);
  if ((catCount?.n ?? 0) === 0) {
    await db.insert(categories).values(SEED_CATEGORIES);
  }

  await db.insert(products).values(SEED_PRODUCTS);

  const all = await db
    .select({ id: products.id, slug: products.slug })
    .from(products);
  const slugToId = new Map(all.map((r) => [r.slug, r.id]));

  await db
    .insert(reviews)
    .values(
      SEED_REVIEWS.map((r) => ({
        productId: slugToId.get(r.productSlug) ?? 0,
        name: r.name,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: "approved",
        createdAt: daysAgo(r.days),
      }))
    );

  const [setCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(settings);
  if ((setCount?.n ?? 0) === 0) {
    await db.insert(settings).values(
      Object.entries(SEED_SETTINGS).map(([key, value]) => ({ key, value }))
    );
  }
  }

  // Ensure the store owner admin always exists
  const [admCount] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(admins);
  if ((admCount?.n ?? 0) === 0) {
    await db.insert(admins).values({
      name: "مالك المتجر",
      email: OWNER_EMAIL,
      passwordHash: createHash("sha256")
        .update(OWNER_DEFAULT_PASSWORD)
        .digest("hex"),
      role: "owner",
      permissions: ALL_PERMISSIONS,
      active: true,
    });
  }
}
