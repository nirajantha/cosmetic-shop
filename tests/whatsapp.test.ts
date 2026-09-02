import assert from "node:assert/strict";
import { test } from "node:test";
import { buildWhatsAppUrl, generateWhatsAppOrderMessage, type WhatsAppOrderInput } from "../src/lib/whatsapp";

const order: WhatsAppOrderInput = {
  orderNumber: "AU-10023",
  items: [
    { productName: "COSRX Snail Mucin Essence", quantity: 2, price: 2400 },
    { productName: "Beauty of Joseon Sunscreen", quantity: 1, price: 2400 },
  ],
  subtotal: 7200,
  discount: 500,
  deliveryCharge: 100,
  total: 6800,
  customerName: "John Doe",
  phone: "98XXXXXXXX",
  address: "Kathmandu",
  city: "Kathmandu",
  province: undefined,
};

test("generateWhatsAppOrderMessage: includes order number, products, and totals", () => {
  const message = generateWhatsAppOrderMessage(order);
  assert.match(message, /Order #AU-10023/);
  assert.match(message, /1\. COSRX Snail Mucin Essence/);
  assert.match(message, /Qty: 2/);
  assert.match(message, /2\. Beauty of Joseon Sunscreen/);
  assert.match(message, /Subtotal: Rs\. 7,200/);
  assert.match(message, /Discount: -Rs\. 500/);
  assert.match(message, /Delivery: Rs\. 100/);
  assert.match(message, /Total: Rs\. 6,800/);
  assert.match(message, /Name: John Doe/);
  assert.match(message, /Please confirm my order\./);
});

test("generateWhatsAppOrderMessage: omits the discount line when there is no discount", () => {
  const message = generateWhatsAppOrderMessage({ ...order, discount: 0 });
  assert.doesNotMatch(message, /Discount:/);
});

test("generateWhatsAppOrderMessage: shows Free when delivery is waived", () => {
  const message = generateWhatsAppOrderMessage({ ...order, deliveryCharge: 0 });
  assert.match(message, /Delivery: Free/);
});

test("buildWhatsAppUrl: strips non-digit characters from the configured phone number", () => {
  const original = process.env.WHATSAPP_PHONE_NUMBER;
  process.env.WHATSAPP_PHONE_NUMBER = "+977 98-123-45678";
  try {
    const url = buildWhatsAppUrl(order);
    assert.ok(url.startsWith("https://wa.me/9779812345678?text="));
  } finally {
    process.env.WHATSAPP_PHONE_NUMBER = original;
  }
});

test("buildWhatsAppUrl: URL-encodes the message body", () => {
  process.env.WHATSAPP_PHONE_NUMBER = "9779800000000";
  const url = buildWhatsAppUrl(order);
  const encodedPart = url.split("?text=")[1];
  assert.equal(decodeURIComponent(encodedPart), generateWhatsAppOrderMessage(order));
});
