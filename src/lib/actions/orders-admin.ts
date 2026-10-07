"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, canTransitionOrder } from "@/lib/order-status";
import type { ActionResult } from "@/lib/actions/types";
import type { OrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin();

  if (!ORDER_STATUSES.includes(status)) {
    return { success: false, error: "Invalid order status." };
  }

  const error = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return "Order not found.";

    if (!canTransitionOrder(order.status, status)) {
      return `Cannot change a ${ORDER_STATUS_LABEL[order.status]} order to ${ORDER_STATUS_LABEL[status]}.`;
    }

    // Restore stock the one time an order transitions into CANCELLED.
    if (status === "CANCELLED") {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    await tx.order.update({
      where: { id },
      data: { status, completedAt: status === "COMPLETED" ? new Date() : null },
    });
    return null;
  });

  if (error) return { success: false, error };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true, message: `Order marked as ${ORDER_STATUS_LABEL[status]}.` };
}
