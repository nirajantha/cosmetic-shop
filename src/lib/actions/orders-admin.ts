"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "@/lib/actions/types";
import type { OrderStatus } from "@/generated/prisma/client";

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin();

  if (!ORDER_STATUSES.includes(status)) {
    return { success: false, error: "Invalid order status." };
  }

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });

    // Restore stock the one time an order transitions into CANCELLED.
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}
