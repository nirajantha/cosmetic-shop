import type { Metadata } from "next";
import Link from "next/link";
import { ProductPagination } from "@/components/product/product-pagination";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOrdersForAdmin } from "@/lib/data/admin-orders";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Orders" };

const STATUS_VARIANT: Record<OrderStatus, "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "secondary",
  CANCELLED: "destructive",
};

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const query = await searchParams;
  const page = query.page ? Number(query.page) : 1;

  const { orders, total, totalPages } = await getOrdersForAdmin({
    search: query.search,
    status: query.status as OrderStatus | undefined,
    page,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Orders</h1>

      <form className="max-w-sm">
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
                  <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {order.createdAt.toLocaleDateString()}
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
