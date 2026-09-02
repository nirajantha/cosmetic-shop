"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/orders-admin";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(value: string | null) {
    if (!value || value === status) return;
    setPending(true);
    const result = await updateOrderStatus(orderId, value as OrderStatus);
    setPending(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not update order status.");
      return;
    }
    toast.success(`Order marked as ${value}`);
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
