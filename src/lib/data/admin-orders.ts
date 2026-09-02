import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

const ORDERS_PAGE_SIZE = 20;

export interface AdminOrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
}

export async function getOrdersForAdmin(filters: AdminOrderFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);

  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: "insensitive" } },
      { customerName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ORDERS_PAGE_SIZE,
      take: ORDERS_PAGE_SIZE,
    }),
    db.order.count({ where }),
  ]);

  return { orders, total, page, pageSize: ORDERS_PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)) };
}

export async function getOrderByIdForAdmin(id: string) {
  return db.order.findUnique({ where: { id }, include: { items: true } });
}
