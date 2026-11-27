import Link from "next/link";
import { notFound } from "next/navigation";
import StoreShell from "@/components/StoreShell";
import Reveal from "@/components/Reveal";
import {
  IconBox,
  IconCheck,
  IconPhone,
  IconTruck,
  IconUser,
  IconWhatsApp,
} from "@/components/icons";
import {
  getOrderWithItems,
  getSettings,
  ORDER_STATUS_LABELS,
} from "@/lib/store";
import { cn, formatPrice, timeAgo } from "@/lib/utils";
import { buildOrderMessage, waLink } from "@/lib/orderMsg";
import { T } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "new", label: "استلام الطلب" },
  { key: "processing", label: "قيد التجهيز" },
  { key: "shipped", label: "تم الشحن" },
  { key: "completed", label: "تم الاستلام" },
];

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const data = await getOrderWithItems(orderNo);
  if (!data) notFound();
  const { order, items } = data;
  const settings = await getSettings();

  const stepIndex = STEPS.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "cancelled";

  // Determine if order is assigned to a staff member (claimed)
  const hasAssignedStaff = order.assignedToStaffId !== null && order.assignedToName !== null;
  const assignedStaffName = order.assignedToName;
  const assignedStaffWa = order.waNumber;

  // Build WhatsApp message
  const waMessage = buildOrderMessage(
    {
      orderNo: order.orderNo,
      customerName: order.customerName,
      phone: order.phone,
      city: order.city,
      address: order.address,
      payment: order.payment,
      notes: order.notes,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      items: items.map((it) => ({
        productName: it.productName,
        options: it.options,
        price: it.price,
        qty: it.qty,
      })),
    },
    { currency: settings.currency, storeName: settings.storeName }
  );

  return (
    <StoreShell>
      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6">
        <Reveal className="text-center">
          <span
            className={cn(
              "animate-pop mx-auto grid h-20 w-20 place-items-center rounded-full",
              cancelled ? "bg-clay/15 text-clay" : "bg-leaf/15 text-leaf"
            )}
          >
            {cancelled ? (
              <IconBox className="h-9 w-9" />
            ) : (
              <IconCheck className="h-9 w-9" />
            )}
          </span>
          <h1 className="font-display mt-5 text-3xl font-black sm:text-4xl">
            {cancelled ? <T k="orderCancelled" /> : <T k="orderConfirmed" />}
          </h1>
          <p className="mt-3 text-sm text-ink/55">
            {cancelled ? <T k="orderCancelledSub" /> : <T k="orderConfSub" />}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-sm font-extrabold text-navy ring-1 ring-line">
            <T k="orderNo" />:
            <span dir="ltr" className="font-display tracking-wider">
              {order.orderNo}
            </span>
          </p>
        </Reveal>

        {/* Timeline */}
        <Reveal delay={120}>
          <div className="mt-10 rounded-3xl bg-paper p-6 ring-1 ring-line sm:p-8">
            {cancelled ? (
              <p className="text-center text-sm font-bold text-clay">
                حالة الطلب: {ORDER_STATUS_LABELS[order.status]}
              </p>
            ) : (
              <ol className="relative flex justify-between">
                <span className="absolute top-5 right-[10%] left-[10%] h-0.5 bg-line" />
                <span
                  className="absolute top-5 right-[10%] h-0.5 bg-leaf transition-all duration-700"
                  style={{
                    width: `${stepIndex <= 0 ? 0 : (stepIndex / (STEPS.length - 1)) * 80}%`,
                  }}
                />
                {STEPS.map((s, i) => (
                  <li key={s.key} className="relative z-10 flex flex-col items-center gap-2">
                    <span
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-full ring-4 ring-cream transition",
                        i <= stepIndex
                          ? "bg-leaf text-white"
                          : "bg-line text-ink/40"
                      )}
                    >
                      {i < stepIndex ? (
                        <IconCheck className="h-4 w-4" />
                      ) : i === 0 ? (
                        <IconBox className="h-4.5 w-4.5" />
                      ) : (
                        <IconTruck className="h-4.5 w-4.5" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-center text-[11px] font-bold",
                        i <= stepIndex ? "text-ink" : "text-ink/40"
                      )}
                    >
                      {s.label}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Reveal>

        {/* Items */}
        <Reveal delay={200}>
          <div className="mt-6 rounded-3xl bg-paper ring-1 ring-line">
            <div className="border-b border-line px-6 py-4">
              <h2 className="font-display text-base font-extrabold">
                <T k="itemsOf" /> ({items.length.toLocaleString("ar-EG")})
              </h2>
            </div>
            <ul className="divide-y divide-line px-6">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 py-4">
                  <span className="block h-16 w-13 shrink-0 overflow-hidden rounded-xl bg-mint ring-1 ring-line">
                    {it.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image}
                        alt={it.productName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-sm font-bold">
                      {it.productName}
                    </span>
                    {it.options && (
                      <span className="text-[11px] text-ink/45">{it.options}</span>
                    )}
                    <span className="block text-[11px] text-ink/40">
                      الكمية: {it.qty.toLocaleString("ar-EG")}
                    </span>
                  </span>
                  <span className="text-sm font-extrabold text-navy">
                    {formatPrice(it.price * it.qty, settings.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line px-6 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/55"><T k="subtotal" /></dt>
                <dd className="font-bold">
                  {formatPrice(order.subtotal, settings.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/55"><T k="shipping" /></dt>
                <dd className="font-bold">
                  {order.shippingFee === 0
                    ? <T k="free" />
                    : formatPrice(order.shippingFee, settings.currency)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3">
                <dt className="font-display font-extrabold"><T k="total" /></dt>
                <dd className="font-display text-xl font-black text-navy">
                  {formatPrice(order.total, settings.currency)}
                </dd>
              </div>
              <p className="pt-1 text-[11px] text-ink/45">
                طريقة الدفع:{" "}
                {order.payment === "cod" ? <T k="payCod" /> : <T k="payCard" />}
              </p>
            </dl>
          </div>
        </Reveal>

        {/* Assigned Staff Info Card - Shows who's handling the order */}
        {!cancelled && hasAssignedStaff && assignedStaffWa && (
          <Reveal delay={140}>
            <div className="grain relative mt-6 overflow-hidden rounded-3xl bg-navy-deep p-6 text-white sm:p-8">
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf/20 text-leaf-bright">
                    <IconUser className="h-4.5 w-4.5" />
                  </span>
                  <h2 className="font-display text-lg font-black">
                    طلبك مع <span className="text-leaf-bright">{assignedStaffName}</span> — يتابعك مباشرة على واتساب
                  </h2>
                </div>
                <p className="mt-2 max-w-lg text-xs leading-6 text-white/60">
                  {assignedStaffName} هو المسؤول عن تجهيز ومتابعة طلبك.
                  اضغط الزر للتواصل معه مباشرة على واتسابه الشخصي مع رسالة جاهزة
                  فيها كل تفاصيل طلبك.
                </p>
                <a
                  href={waLink(assignedStaffWa, waMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-leaf-bright px-7 py-3.5 font-display text-sm font-black text-ink shadow-2xl shadow-leaf-bright/30 transition-all hover:-translate-y-0.5 hover:bg-paper"
                >
                  <IconWhatsApp className="h-4.5 w-4.5" />
                  التحدث مع {assignedStaffName} على واتساب
                </a>
              </div>
            </div>
          </Reveal>
        )}

        {/* Fallback: Store/Owner WhatsApp if no staff assigned yet */}
        {!cancelled && !hasAssignedStaff && order.waNumber && (
          <Reveal delay={140}>
            <div className="grain relative mt-6 overflow-hidden rounded-3xl bg-navy-deep p-6 text-white sm:p-8">
              <div className="relative">
                <h2 className="font-display flex items-center gap-2.5 text-lg font-black">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf/20 text-leaf-bright">
                    <IconWhatsApp className="h-4.5 w-4.5" />
                  </span>
                  طلبك في صندوق وارد الفريق — فريقنا على واتساب جاهز يتابع طلبك
                </h2>
                <p className="mt-2 max-w-lg text-xs leading-6 text-white/60">
                  طلبك بانتظار استلامه من أحد أعضاء الفريق. يمكنك التواصل مع
                  رقم المتجر الرئيسي للاستفسارات العامة.
                </p>
                <a
                  href={waLink(order.waNumber, waMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-leaf-bright px-7 py-3.5 font-display text-sm font-black text-ink shadow-2xl shadow-leaf-bright/30 transition-all hover:-translate-y-0.5 hover:bg-paper"
                >
                  <IconWhatsApp className="h-4.5 w-4.5" />
                  فتح محادثة واتساب المتجر بالتفاصيل
                </a>
              </div>
            </div>
          </Reveal>
        )}

        {/* Info cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Reveal delay={260}>
            <div className="rounded-3xl bg-paper p-6 ring-1 ring-line">
              <h3 className="flex items-center gap-2 text-sm font-extrabold">
                <IconUser className="h-4.5 w-4.5 text-leaf" />
                <T k="deliveryTo" />
              </h3>
              <p className="mt-3 text-sm font-bold">{order.customerName}</p>
              <p className="mt-1 text-xs leading-6 text-ink/55">
                {order.city} — {order.address}
              </p>
              <p className="mt-1 text-xs text-ink/55" dir="ltr">
                {order.phone}
              </p>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-col justify-between rounded-3xl bg-navy-deep p-6 text-white">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-extrabold">
                  <IconWhatsApp className="h-4.5 w-4.5 text-leaf-bright" />
                  <T k="needHelp" />
                </h3>
                <p className="mt-2 text-xs leading-6 text-white/60">
                  فريقنا على واتساب 24 ساعة — أي سؤال عن الطلب أو استبدال،
                  ابعتلنا مباشرة.
                </p>
              </div>
              <a
                href={`https://wa.me/2${settings.whatsapp}?text=${encodeURIComponent(`أهلًا، عندي استفسار عن طلبي ${order.orderNo}`)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-leaf-bright px-5 py-3 text-xs font-black text-ink transition hover:bg-paper"
              >
                <IconPhone className="h-4 w-4" />
                <T k="waNow" />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={380} className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-8 py-3.5 text-sm font-bold text-white transition hover:bg-navy-deep"
          >
            <T k="backStore" />
          </Link>
          <p className="mt-3 text-[11px] text-ink/40">
            <T k="createdAgo" /> {timeAgo(order.createdAt)}
          </p>
        </Reveal>
      </div>
    </StoreShell>
  );
}
