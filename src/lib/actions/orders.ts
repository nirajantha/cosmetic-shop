"use server";

import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getLiveOffersForPricing } from "@/lib/data/offers";
import { calculateDeliveryCharge, calculateEffectivePrice } from "@/lib/pricing";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { checkoutRequestSchema, type CheckoutRequestInput } from "@/lib/validations/checkout";

export interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderNumber?: string;
  whatsappUrl?: string;
}

export async function createOrder(input: CheckoutRequestInput): Promise<CreateOrderResult> {
  const parsed = checkoutRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid checkout details." };
  }
  const { customer, items } = parsed.data;

  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || product.status === "ARCHIVED" || product.status === "DRAFT") {
      return { success: false, error: "One or more items in your cart are no longer available. Please refresh your cart." };
    }
    if (product.status === "OUT_OF_STOCK" || product.stock < item.quantity) {
      return { success: false, error: `${product.name} doesn't have enough stock available right now.` };
    }
  }

  const activeOffers = await getLiveOffersForPricing();

  let subtotal = 0;
  let discount = 0;
  const orderItemsData = items.map((item) => {
    const product = productById.get(item.productId)!;
    const pricing = calculateEffectivePrice(product, activeOffers);
    subtotal += pricing.originalPrice * item.quantity;
    discount += pricing.discountAmount * item.quantity;

    return {
      productId: product.id,
      productName: product.name,
      productImage: product.images[0]?.url ?? null,
      quantity: item.quantity,
      price: pricing.effectivePrice,
      discount: pricing.discountAmount,
      total: pricing.effectivePrice * item.quantity,
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;
  discount = Math.round(discount * 100) / 100;
  const deliveryCharge = calculateDeliveryCharge(subtotal - discount);
  const total = Math.round((subtotal - discount + deliveryCharge) * 100) / 100;

  try {
    const order = await db.$transaction(async (tx) => {
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          const product = productById.get(item.productId);
          throw new Error(`${product?.name ?? "An item"} doesn't have enough stock available right now.`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber: randomUUID(),
          customerName: customer.customerName,
          phone: customer.phone,
          email: customer.email || null,
          province: customer.province || null,
          city: customer.city,
          address: customer.address,
          notes: customer.notes || null,
          subtotal,
          discount,
          deliveryCharge,
          total,
          whatsappSent: true,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      const orderNumber = `AU-${10000 + created.orderSeq}`;
      return tx.order.update({
        where: { id: created.id },
        data: { orderNumber },
        include: { items: true },
      });
    });

    const whatsappUrl = buildWhatsAppUrl({
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      deliveryCharge: Number(order.deliveryCharge),
      total: Number(order.total),
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      province: order.province,
    });

    return { success: true, orderNumber: order.orderNumber, whatsappUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong creating your order.";
    return { success: false, error: message };
  }
}
