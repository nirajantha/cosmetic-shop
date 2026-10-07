import type { OrderStatus } from "@/generated/prisma/client";

export const ORDER_STATUSES: OrderStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Allowed workflow: PENDING -> IN_PROGRESS -> COMPLETED, with cancellation before completion.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}
