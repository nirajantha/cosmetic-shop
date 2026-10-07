"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/lib/actions/orders-admin";
import type { OrderStatus } from "@/generated/prisma/client";

export function OrderStatusActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function takeOrder() {
    setPending(true);
    const result = await updateOrderStatus(orderId, "IN_PROGRESS");
    setPending(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not take this order.");
      return;
    }
    toast.success("Order taken — now in progress.");
    router.refresh();
  }

  if (status === "COMPLETED" || status === "CANCELLED") return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "PENDING" && (
        <Button type="button" size="sm" disabled={pending} onClick={takeOrder}>
          {pending ? "Working..." : "Take Order"}
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <ConfirmActionButton
          label="Mark Completed"
          title="Complete this order?"
          description="Confirm the order has been delivered and paid. It will be counted in your sales and can no longer be changed."
          variant="default"
          action={() => updateOrderStatus(orderId, "COMPLETED")}
        />
      )}
      <ConfirmActionButton
        label="Cancel Order"
        title="Cancel this order?"
        description="The ordered quantities will be returned to stock. This cannot be undone."
        variant="destructive"
        action={() => updateOrderStatus(orderId, "CANCELLED")}
      />
    </div>
  );
}
