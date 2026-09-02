import { formatCurrency } from "@/lib/utils";

export interface WhatsAppOrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface WhatsAppOrderInput {
  orderNumber: string;
  items: WhatsAppOrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  province?: string | null;
}

export function generateWhatsAppOrderMessage(order: WhatsAppOrderInput): string {
  const lines: string[] = [];

  lines.push("Hello, I would like to place an order.", "", `Order #${order.orderNumber}`, "", "Products:", "");

  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.productName}`, `   Qty: ${item.quantity}`, `   Price: ${formatCurrency(item.price)}`, "");
  });

  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`);
  if (order.discount > 0) lines.push(`Discount: -${formatCurrency(order.discount)}`);
  lines.push(`Delivery: ${order.deliveryCharge > 0 ? formatCurrency(order.deliveryCharge) : "Free"}`, "", `Total: ${formatCurrency(order.total)}`, "");

  lines.push(
    "Customer:",
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Address: ${[order.address, order.city, order.province].filter(Boolean).join(", ")}`,
    "",
    "Please confirm my order."
  );

  return lines.join("\n");
}

/** Digits-only phone number, as required by the wa.me link format. */
function sanitizeWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppUrl(order: WhatsAppOrderInput): string {
  const phoneNumber = sanitizeWhatsAppNumber(process.env.WHATSAPP_PHONE_NUMBER ?? "");
  const message = generateWhatsAppOrderMessage(order);
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
