import { db } from "@/lib/db";

export async function getDashboardStats() {
  const now = new Date();

  const [
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalOrders,
    pendingOrders,
    salesAggregate,
    activeOffers,
  ] = await Promise.all([
    db.product.count({ where: { status: { not: "ARCHIVED" } } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.count({ where: { status: "OUT_OF_STOCK" } }),
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { notIn: ["CANCELLED"] } },
    }),
    db.offer.count({ where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } } }),
  ]);

  return {
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalOrders,
    pendingOrders,
    totalSales: Number(salesAggregate._sum.total ?? 0),
    activeOffers,
  };
}

export async function getOrdersOverTime(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const orders = await db.order.findMany({
    where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
    select: { createdAt: true, total: true },
  });

  const buckets = new Map<string, { orders: number; revenue: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, { orders: 0, revenue: 0 });
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(order.total);
    }
  }

  return Array.from(buckets.entries()).map(([date, values]) => ({ date, ...values }));
}

export async function getBestSellingProducts(limit = 5) {
  const grouped = await db.orderItem.groupBy({
    by: ["productId", "productName"],
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
