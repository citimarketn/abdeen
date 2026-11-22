export interface OrderMsgItem {
  productName: string;
  options: string | null;
  price: number;
  qty: number;
}

export interface OrderMsgData {
  orderNo: string;
  customerName: string;
  phone: string;
  city: string | null;
  address: string | null;
  payment: string;
  notes: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderMsgItem[];
}

/** Build a rich WhatsApp message with the full order details. */
export function buildOrderMessage(
  o: OrderMsgData,
  s: { currency: string; storeName?: string }
): string {
  const lines: string[] = [];
  lines.push(`🛍️ طلب جديد — ${o.orderNo}`);
  lines.push("────────────────");
  lines.push(`👤 العميل: ${o.customerName}`);
  lines.push(`📞 الموبايل: ${o.phone}`);
  if (o.city) lines.push(`📍 المحافظة: ${o.city}`);
  if (o.address) lines.push(`🏠 العنوان: ${o.address}`);
  lines.push("");
  lines.push("📦 المحتويات:");
  for (const it of o.items) {
    const opt = it.options ? ` (${it.options})` : "";
    lines.push(
      `• ${it.productName}${opt} × ${it.qty} = ${(it.price * it.qty).toLocaleString("ar-EG")} ${s.currency}`
    );
  }
  lines.push("────────────────");
  lines.push(`المجموع: ${o.subtotal.toLocaleString("ar-EG")} ${s.currency}`);
  lines.push(
    `التوصيل: ${o.shippingFee === 0 ? "مجاني" : `${o.shippingFee} ${s.currency}`}`
  );
  lines.push(`💰 الإجمالي: ${o.total.toLocaleString("ar-EG")} ${s.currency}`);
  lines.push(
    `💳 الدفع: ${o.payment === "cod" ? "عند الاستلام (كاش)" : "بطاقة / محفظة إلكترونية"}`
  );
  if (o.notes) lines.push(`📝 ملاحظة: ${o.notes}`);
  lines.push("");
  lines.push(`— من متجر ${s.storeName ?? "عابدين"}`);
  return lines.join("\n");
}

export function waLink(number: string, message: string): string {
  const num = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}
