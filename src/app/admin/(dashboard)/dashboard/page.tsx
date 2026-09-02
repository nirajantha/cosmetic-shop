import type { Metadata } from "next";
import { CheckCircle2, DollarSign, Package, Percent, ShoppingCart, XCircle } from "lucide-react";
import { BestSellersChart } from "@/components/admin/best-sellers-chart";
import { StatCard } from "@/components/admin/stat-card";
import { TrendLineChart } from "@/components/admin/trend-line-chart";
import { getBestSellingProducts, getDashboardStats, getOrdersOverTime } from "@/lib/data/admin-stats";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, ordersOverTime, bestSellers] = await Promise.all([
    getDashboardStats(),
    getOrdersOverTime(14),
    getBestSellingProducts(5),
  ]);

  const orderPoints = ordersOverTime.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.orders,
  }));
  const revenuePoints = ordersOverTime.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: d.revenue,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Products" value={String(stats.totalProducts)} icon={Package} />
        <StatCard label="Active Products" value={String(stats.activeProducts)} icon={CheckCircle2} />
        <StatCard label="Out of Stock" value={String(stats.outOfStockProducts)} icon={XCircle} />
        <StatCard label="Total Orders" value={String(stats.totalOrders)} icon={ShoppingCart} />
        <StatCard label="Pending Orders" value={String(stats.pendingOrders)} icon={ShoppingCart} />
        <StatCard label="Total Sales" value={formatCurrency(stats.totalSales)} icon={DollarSign} />
        <StatCard label="Active Offers" value={String(stats.activeOffers)} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendLineChart title="Orders Over Time (14 days)" points={orderPoints} formatValue={(v) => String(v)} />
        <TrendLineChart title="Revenue Over Time (14 days)" points={revenuePoints} formatValue={formatCurrency} />
      </div>

      <BestSellersChart items={bestSellers} />
    </div>
  );
}
