import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getOrderByIdForAdmin } from "@/lib/data/admin-orders";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Detail" };

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderByIdForAdmin(id);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl">Order {order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">Placed {order.createdAt.toLocaleString()}</p>
          {order.completedAt && (
            <p className="text-sm text-muted-foreground">Completed {order.completedAt.toLocaleString()}</p>
          )}
        </div>
        <OrderStatusActions orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-sm font-semibold">Products</h2>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p>{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
            <dl className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd>-{formatCurrency(order.discount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{formatCurrency(order.deliveryCharge)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </div>

          {order.notes && (
            <div className="rounded-xl border border-border bg-background p-5">
              <h2 className="text-sm font-semibold">Order Notes</h2>
              <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-sm font-semibold">Customer Details</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>{order.phone}</dd>
              </div>
              {order.email && (
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd>{order.email}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Address</dt>
                <dd>{[order.address, order.city, order.province].filter(Boolean).join(", ")}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <h2 className="text-sm font-semibold">WhatsApp Status</h2>
            <p className="mt-2 flex items-center gap-2 text-sm">
              {order.whatsappSent ? (
                <>
                  <CheckCircle2 className="size-4 text-brand-gold" /> Sent to customer
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-muted-foreground" /> Not sent
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
