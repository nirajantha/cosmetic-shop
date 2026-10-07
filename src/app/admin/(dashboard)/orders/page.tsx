import type { Metadata } from "next";
import Link from "next/link";
import { ProductPagination } from "@/components/product/product-pagination";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrdersForAdmin } from "@/lib/data/admin-orders";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { cn, formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Orders" };

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const query = await searchParams;
  const page = query.page ? Number(query.page) : 1;
  const status = ORDER_STATUSES.includes(query.status as OrderStatus) ? (query.status as OrderStatus) : undefined;

  const { orders, total, totalPages } = await getOrdersForAdmin({
    search: query.search,
    status,
    page,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {[undefined, ...ORDER_STATUSES].map((option) => (
          <Link
            key={option ?? "ALL"}
            href={option ? `/admin/orders?status=${option}` : "/admin/orders"}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-sm",
              option === status ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {option ? ORDER_STATUS_LABEL[option] : "All"}
          </Link>
        ))}
      </div>

      <form className="max-w-sm">
        {status && <input type="hidden" name="status" value={status} />}
        <Input name="search" placeholder="Search by order #, name or phone..." defaultValue={query.search} />
      </form>

      <p className="text-sm text-muted-foreground">{total} order{total === 1 ? "" : "s"}</p>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link href={`/admin/orders/${order.id}`} className="font-medium underline-offset-4 hover:underline">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-muted-foreground">{order.phone}</TableCell>
                <TableCell>{order._count.items}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {order.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <OrderStatusActions orderId={order.id} status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductPagination page={page} totalPages={totalPages} searchParams={query} basePath="/admin/orders" />
    </div>
  );
}
