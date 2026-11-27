import { db } from "@/db";
import {
  categories,
  orderItems,
  orders,
  products,
  reviews,
  settings,
  staff,
  type Category,
  type Order,
  type OrderItem,
  type Product,
  type Review,
  type Staff,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import {
  DEFAULT_PRIVACY,
  DEFAULT_RETURNS,
  DEFAULT_TERMS,
} from "./legalDefaults";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";

export const DEFAULT_SETTINGS: Record<string, string> = {
  storeName: "عابدين",
  storeTagline: "ONLINE STORE",
  ticker: JSON.stringify([
    "أهلاً بكم في متجر عابدين — تسوّق وكأّنت على الأرض",
    "توصيل مجاني للطلبات فوق 1,000 ج.م",
    "خصومات تصل إلى 40% على تشكيلات مختارة",
    "الدفع عند الاستلام متاح في جميع المحافظات",
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
  adminEmail: "abdeenali520@gmail.com",
  secCode1: process.env.ADMIN_SEC_CODE_1 || "",
  secCode2: process.env.ADMIN_SEC_CODE_2 || "",
  secCode3: process.env.ADMIN_SEC_CODE_3 || "",
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
  legalTerms: DEFAULT_TERMS,
  legalReturns: DEFAULT_RETURNS,
  legalPrivacy: DEFAULT_PRIVACY,
  legalUpdated: "2026",
};

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  ticker: string[];
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroCtaSecondary: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  freeShippingOver: number;
  shippingFee: number;
  freeShippingEnabled: boolean;
  currency: string;
  paymentNote: string;
  aboutText: string;
  adminEmail: string;
  secCode1: string;
  secCode2: string;
  secCode3: string;
  googleClientId: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  socialTelegram: string;
  heroBg: string;
  heroBgMotion: string;
  shopBg: string;
  shopBgMotion: string;
  cartBg: string;
  siteBg: string;
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerCta: string;
  bannerLink: string;
  showCollections: boolean;
  showDeals: boolean;
  showBest: boolean;
  showValues: boolean;
  showTestimonials: boolean;
  showBanner: boolean;
  showFaq: boolean;
  heroImage: string;
  heroStat1: string;
  heroStat2: string;
  heroStat3: string;
  heroBadge: string;
  workingHours: string;
  emailProvider: string;
  emailApiKey: string;
  emailFrom: string;
  firebaseProject: string;
  paMailUrl: string;
  paMailKey: string;
  legalTerms: string;
  legalReturns: string;
  legalPrivacy: string;
  legalUpdated: string;
}

export function parseSettings(rows: Record<string, string>): StoreSettings {
  const s = { ...DEFAULT_SETTINGS, ...rows };
  let ticker: string[] = [];
  try {
    ticker = JSON.parse(s.ticker);
  } catch {
    ticker = [s.ticker];
  }
  const yes = (v: string) => v !== "no";
  return {
    storeName: s.storeName,
    storeTagline: s.storeTagline,
    ticker,
    heroKicker: s.heroKicker,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    heroCta: s.heroCta,
    heroCtaSecondary: s.heroCtaSecondary,
    whatsapp: s.whatsapp,
    phone: s.phone,
    email: s.email,
    address: s.address,
    freeShippingOver: Number(s.freeShippingOver) || 1000,
    shippingFee: Number(s.shippingFee) || 50,
    freeShippingEnabled: yes(s.freeShippingEnabled),
    currency: s.currency,
    paymentNote: s.paymentNote,
    aboutText: s.aboutText,
    adminEmail: s.adminEmail,
    secCode1: s.secCode1,
    secCode2: s.secCode2,
    secCode3: s.secCode3,
    googleClientId: s.googleClientId,
    socialFacebook: s.socialFacebook,
    socialInstagram: s.socialInstagram,
    socialYoutube: s.socialYoutube,
    socialTelegram: s.socialTelegram,
    heroBg: s.heroBg,
    heroBgMotion: s.heroBgMotion,
    shopBg: s.shopBg,
    shopBgMotion: s.shopBgMotion,
    cartBg: s.cartBg,
    siteBg: s.siteBg,
    bannerImage: s.bannerImage,
    bannerTitle: s.bannerTitle,
    bannerSubtitle: s.bannerSubtitle,
    bannerCta: s.bannerCta,
    bannerLink: s.bannerLink,
    showCollections: yes(s.showCollections),
    showDeals: yes(s.showDeals),
    showBest: yes(s.showBest),
    showValues: yes(s.showValues),
    showTestimonials: yes(s.showTestimonials),
    showBanner: yes(s.showBanner),
    showFaq: yes(s.showFaq),
    heroImage: s.heroImage,
    heroStat1: s.heroStat1,
    heroStat2: s.heroStat2,
    heroStat3: s.heroStat3,
    heroBadge: s.heroBadge,
    workingHours: s.workingHours,
    emailProvider: s.emailProvider,
    emailApiKey: s.emailApiKey,
    emailFrom: s.emailFrom,
    firebaseProject: s.firebaseProject,
    paMailUrl: s.paMailUrl,
    paMailKey: s.paMailKey,
    legalTerms: s.legalTerms || DEFAULT_TERMS,
    legalReturns: s.legalReturns || DEFAULT_RETURNS,
    legalPrivacy: s.legalPrivacy || DEFAULT_PRIVACY,
    legalUpdated: s.legalUpdated || "2026",
  };
}

export async function getSettings(): Promise<StoreSettings> {
  try {
    await ensureSeeded();
    const rows = await db.select().from(settings);
    return parseSettings(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } catch {
    return parseSettings({});
  }
}

export async function getSettingsRaw(): Promise<Record<string, string>> {
  try {
    await ensureSeeded();
    const rows = await db.select().from(settings);
    return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    await ensureSeeded();
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.active, true))
      .orderBy(asc(categories.sortOrder));
    return rows;
  } catch {
    return [];
  }
}

export type ProductWithStats = Product & {
  avgRating: number | null;
  ratingCount: number;
};

const withStats = (extra?: (t: typeof products) => unknown) => ({
  id: products.id,
  name: products.name,
  slug: products.slug,
  description: products.description,
  categorySlug: products.categorySlug,
  price: products.price,
  oldPrice: products.oldPrice,
  stock: products.stock,
  images: products.images,
  sizes: products.sizes,
  colors: products.colors,
  badge: products.badge,
  featured: products.featured,
  active: products.active,
  sales: products.sales,
  videoUrl: products.videoUrl,
  deliveryDays: products.deliveryDays,
  source: products.source,
  createdAt: products.createdAt,
  avgRating: sql<number | null>`round(avg(${reviews.rating})::numeric, 1)`.as("avgRating"),
  ratingCount: sql<number>`count(${reviews.id})::int`.as("ratingCount"),
  ...extra,
});

export interface ShopFilters {
  q?: string;
  cat?: string;
  sort?: string;
  sale?: boolean;
  fresh?: boolean;
  best?: boolean;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  inStock?: boolean;
  limit?: number;
}

export async function queryProducts(f: ShopFilters = {}): Promise<ProductWithStats[]> {
  try {
    await ensureSeeded();
    const conds = [eq(products.active, true)];
    if (f.q) {
      conds.push(
        or(
          sql`${products.name} ilike '%' || ${f.q} || '%'`,
          sql`${products.description} ilike '%' || ${f.q} || '%'`
        )!
      );
    }
    if (f.cat) conds.push(eq(products.categorySlug, f.cat));
    if (f.sale) conds.push(isNotNull(products.oldPrice));
    if (f.fresh) conds.push(eq(products.badge, "جديد"));
    if (f.best) conds.push(inArray(products.badge, ["الأكثر مبيعاً", "خصم"]));

    let orderBy: unknown[];
    switch (f.sort) {
      case "price-asc":
        orderBy = [asc(products.price)];
        break;
      case "price-desc":
        orderBy = [desc(products.price)];
        break;
      case "rating":
        orderBy = [desc(sql`avg(${reviews.rating})`), desc(products.sales)];
        break;
      case "best":
        orderBy = [desc(products.sales)];
        break;
      default:
        orderBy = f.best ? [desc(products.sales)] : [desc(products.createdAt)];
    }

    let rows = await db
      .select(withStats())
      .from(products)
      .leftJoin(
        reviews,
        and(eq(reviews.productId, products.id), eq(reviews.status, "approved"))
      )
      .where(and(...conds))
      .groupBy(products.id)
      .orderBy(...(orderBy as never[]));

    if (f.priceMin != null) rows = rows.filter((r) => r.price >= f.priceMin!);
    if (f.priceMax != null) rows = rows.filter((r) => r.price <= f.priceMax!);
    if (f.minRating != null)
      rows = rows.filter((r) => (r.avgRating ?? 0) >= f.minRating!);
    if (f.inStock) rows = rows.filter((r) => r.stock > 0);
    if (f.limit) rows = rows.slice(0, f.limit);
    return rows;
  } catch {
    return [];
  }
}

export async function getProductWithReviews(
  slug: string
): Promise<{
  product: ProductWithStats | null;
  category: Category | null;
  reviewsList: Review[];
  related: ProductWithStats[];
} | null> {
  try {
    await ensureSeeded();
    const rows = await db
      .select(withStats())
      .from(products)
      .leftJoin(
        reviews,
        and(eq(reviews.productId, products.id), eq(reviews.status, "approved"))
      )
      .where(and(eq(products.slug, slug), eq(products.active, true)))
      .groupBy(products.id);
    const product = rows[0] ?? null;
    if (!product) return null;

    const [cat, reviewsList, related] = await Promise.all([
      db
        .select()
        .from(categories)
        .where(eq(categories.slug, product.categorySlug))
        .then((r) => r[0] ?? null),
      db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, product.id), eq(reviews.status, "approved")))
        .orderBy(desc(reviews.createdAt)),
      queryProducts({ cat: product.categorySlug, limit: 4 }),
    ]);
    return { product, category: cat, reviewsList, related };
  } catch {
    return null;
  }
}

export async function getTestimonials(): Promise<
  Array<{ review: Review; productName: string; productSlug: string }>
> {
  try {
    await ensureSeeded();
    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        name: reviews.name,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        status: reviews.status,
        createdAt: reviews.createdAt,
        productName: products.name,
        productSlug: products.slug,
      })
      .from(reviews)
      .innerJoin(products, eq(products.id, reviews.productId))
      .where(and(eq(reviews.status, "approved"), gte(reviews.rating, 4)))
      .orderBy(desc(reviews.rating), desc(reviews.createdAt))
      .limit(4);
    return rows.map((r) => ({
      review: {
        id: r.id,
        productId: r.productId,
        name: r.name,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: r.status,
        createdAt: r.createdAt,
      },
      productName: r.productName,
      productSlug: r.productSlug,
    }));
  } catch {
    return [];
  }
}

export async function createOrder(input: {
  items: Array<{
    slug: string;
    size?: string;
    color?: string;
    qty: number;
  }>;
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  payment: string;
  notes?: string;
  freeShippingOver: number;
  freeShippingEnabled: boolean;
  shippingFee: number;
  ownerWa: string;
  storeName: string;
}): Promise<{
  ok: boolean;
  orderNo?: string;
  error?: string;
  items?: ProductWithStats[];
  assignedToName?: string;
  waNumber?: string;
}> {
  try {
    await ensureSeeded();
    const slugs = input.items.map((i) => i.slug);
    const prods = await db
      .select()
      .from(products)
      .where(and(inArray(products.slug, slugs), eq(products.active, true)));
    const bySlug = new Map(prods.map((p) => [p.slug, p]));

    let subtotal = 0;
    const resolved: Array<{
      product: Product;
      size?: string;
      color?: string;
      qty: number;
    }> = [];
    for (const item of input.items) {
      const p = bySlug.get(item.slug);
      if (!p) return { ok: false, error: `المنتج ${item.slug} غير متاح` };
      const qty = Math.max(1, Math.min(item.qty || 1, 99));
      if (p.stock < qty)
        return { ok: false, error: `الكمية المطلوبة من ${p.name} غير متوفرة` };
      subtotal += p.price * qty;
      resolved.push({ product: p, size: item.size, color: item.color, qty });
    }
    if (resolved.length === 0) return { ok: false, error: "السلة فارغة" };

    const shippingFee =
      input.freeShippingEnabled && subtotal >= input.freeShippingOver
        ? 0
        : input.shippingFee;
    const total = subtotal + shippingFee;
    const orderNo = `ADB-${Math.floor(1000 + Math.random() * 9000)}`;

    const [orderRow] = await db
      .insert(orders)
      .values({
        orderNo,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || null,
        city: input.city,
        address: input.address,
        payment: input.payment,
        notes: input.notes || null,
        subtotal,
        shippingFee,
        total,
        status: "new",
        // Order starts unclaimed in team inbox; waNumber is owner's for initial notification
        waNumber: input.ownerWa,
        assignedToStaffId: null,
        assignedToName: null,
        claimedAt: null,
      })
      .returning();

    for (const item of resolved) {
      await db.insert(orderItems).values({
        orderId: orderRow.id,
        productId: item.product.id,
        productName: item.product.name,
        options:
          [item.size && item.size !== "مقاس واحد" ? item.size : null, item.color && item.color !== "متعدد" ? item.color : null]
            .filter(Boolean)
            .join(" · ") || null,
        price: item.product.price,
        qty: item.qty,
        image: item.product.images?.[0] ?? null,
      });
      await db
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.qty}`,
          sales: sql`${products.sales} + ${item.qty}`,
        })
        .where(eq(products.id, item.product.id));
    }

    // Order is now in team inbox, unclaimed
    // Staff will claim it via /api/staff/claim
    return {
      ok: true,
      orderNo,
      assignedToName: undefined,
      waNumber: input.ownerWa,
    };
  } catch (e) {
    console.error("createOrder failed", e);
    return { ok: false, error: "تعذر إنشاء الطلب، حاول مجددًا" };
  }
}

/**
 * Atomically claim an order for a staff member.
 * Uses a WHERE clause to prevent race conditions (double-claiming).
 * Returns the claimed order details or an error if already claimed.
 */
export async function claimOrder(
  orderId: number,
  staffId: number,
  staffName: string,
  staffWhatsApp: string
): Promise<{
  ok: boolean;
  orderNo?: string;
  assignedToName?: string;
  waNumber?: string;
  error?: string;
}> {
  try {
    await ensureSeeded();

    // Atomic claim: only update if not already assigned
    const result = await db
      .update(orders)
      .set({
        assignedToStaffId: staffId,
        assignedToName: staffName,
        waNumber: staffWhatsApp,
        claimedAt: new Date(),
      })
      .where(and(eq(orders.id, orderId), isNull(orders.assignedToStaffId)))
      .returning({ orderNo: orders.orderNo });

    if (result.length === 0) {
      // Check if it was already claimed
      const [existing] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId));

      if (!existing) {
        return { ok: false, error: "الطلب غير موجود" };
      }
      if (existing.assignedToStaffId) {
        return { ok: false, error: "تم استلام هذا الطلب بالفعل من قبل زميل آخر" };
      }
      return { ok: false, error: "تعذر استلام الطلب، حاول مجددًا" };
    }

    return {
      ok: true,
      orderNo: result[0].orderNo,
      assignedToName: staffName,
      waNumber: staffWhatsApp,
    };
  } catch (e) {
    console.error("claimOrder failed", e);
    return { ok: false, error: "حدث خطأ أثناء استلام الطلب" };
  }
}

/**
 * Release an order back to the team inbox.
 * Resets assignment to owner's WhatsApp for notifications.
 */
export async function releaseOrder(
  orderId: number,
  staffId: number,
  ownerWa: string,
  reason?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await ensureSeeded();

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order) {
      return { ok: false, error: "الطلب غير موجود" };
    }

    if (order.assignedToStaffId !== staffId) {
      return { ok: false, error: "لا يمكنك إرجاع طلب لم تستلمه" };
    }

    await db
      .update(orders)
      .set({
        assignedToStaffId: null,
        assignedToName: null,
        waNumber: ownerWa,
        claimedAt: null,
        releasedAt: new Date(),
        releaseReason: reason || null,
      })
      .where(eq(orders.id, orderId));

    return { ok: true };
  } catch (e) {
    console.error("releaseOrder failed", e);
    return { ok: false, error: "حدث خطأ أثناء إرجاع الطلب" };
  }
}

export async function getOrderWithItems(orderNo: string) {
  try {
    await ensureSeeded();
    const [order] = await db.select().from(orders).where(eq(orders.orderNo, orderNo));
    if (!order) return null;
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    return { order, items };
  } catch {
    return null;
  }
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "طلب جديد",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS);

export async function getAdminDashboard() {
  try {
    await ensureSeeded();
    const [revArr, ordArr, prodArr, reviewArr, lowArr, cityRow] =
      await Promise.all([
        db
          .select({ total: sql<number>`coalesce(sum(${orders.total}),0)::int` })
          .from(orders)
          .where(sql`${orders.status} != 'cancelled'`),
        db.select({ n: sql<number>`count(*)::int` }).from(orders),
        db.select({ n: sql<number>`count(*)::int` }).from(products),
        db
          .select({ n: sql<number>`count(*)::int` })
          .from(reviews)
          .where(eq(reviews.status, "pending")),
        db
          .select({ n: sql<number>`count(*)::int` })
          .from(products)
          .where(lte(products.stock, 10)),
        db
          .select({ city: orders.city, n: sql<number>`count(*)::int` })
          .from(orders)
          .groupBy(orders.city)
          .orderBy(desc(sql`count(*)`))
          .limit(5),
      ]);
    const recentOrders = (await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(6)) as Order[];
    const topProducts = (await db
      .select()
      .from(products)
      .orderBy(desc(products.sales))
      .limit(5)) as Product[];
    return {
      revenue: revArr[0]?.total ?? 0,
      ordersCount: ordArr[0]?.n ?? 0,
      productsCount: prodArr[0]?.n ?? 0,
      pendingReviews: reviewArr[0]?.n ?? 0,
      lowStock: lowArr[0]?.n ?? 0,
      topCities: cityRow ?? [],
      recentOrders,
      topProducts,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export type { Category, Order, OrderItem, Product, Review };
