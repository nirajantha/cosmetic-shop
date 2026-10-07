import { db } from "@/lib/db";

export async function getDashboardStats() {
  const now = new Date();

  const [
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    salesAggregate,
    activeOffers,
  ] = await Promise.all([
    db.product.count({ where: { status: { not: "ARCHIVED" } } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.count({ where: { status: "OUT_OF_STOCK" } }),
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "IN_PROGRESS" } }),
    db.order.count({ where: { status: "COMPLETED" } }),
    // Only completed orders count as sales.
    db.order.aggregate({
      _sum: { total: true },
      where: { status: "COMPLETED" },
    }),
    db.offer.count({ where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } } }),
  ]);

  return {
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    totalSales: Number(salesAggregate._sum.total ?? 0),
    activeOffers,
  };
}

export async function getOrdersOverTime(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Orders are bucketed by when they were placed; revenue by when it was earned (completion).
  const [orders, completed] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true },
    }),
    db.order.findMany({
      where: { status: "COMPLETED", completedAt: { gte: since } },
      select: { completedAt: true, total: true },
    }),
  ]);

  const buckets = new Map<string, { orders: number; revenue: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, { orders: 0, revenue: 0 });
  }

  for (const order of orders) {
    const bucket = buckets.get(order.createdAt.toISOString().slice(0, 10));
    if (bucket) bucket.orders += 1;
  }

  for (const order of completed) {
    const bucket = order.completedAt && buckets.get(order.completedAt.toISOString().slice(0, 10));
    if (bucket) bucket.revenue += Number(order.total);
  }

  return Array.from(buckets.entries()).map(([date, values]) => ({ date, ...values }));
}

export async function getBestSellingProducts(limit = 5) {
  const grouped = await db.orderItem.groupBy({
    by: ["productId", "productName"],
    where: { order: { status: "COMPLETED" } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  return grouped.map((row) => ({
    productId: row.productId,
    productName: row.productName,
    quantitySold: row._sum.quantity ?? 0,
  }));
}
