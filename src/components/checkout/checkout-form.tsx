"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOrder } from "@/lib/actions/orders";
import { checkoutCustomerSchema, type CheckoutCustomerInput } from "@/lib/validations/checkout";
import { calculateDeliveryCharge } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { useHydrated } from "@/hooks/use-hydrated";
import { selectDiscount, selectSubtotal, selectTotal, useCartStore } from "@/store/cart-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CheckoutForm() {
  const mounted = useHydrated();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectSubtotal);
  const discount = useCartStore(selectDiscount);
  const total = useCartStore(selectTotal);
  const deliveryCharge = calculateDeliveryCharge(subtotal - discount);

  const [orderResult, setOrderResult] = useState<{ orderNumber: string; whatsappUrl: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutCustomerInput>({ resolver: zodResolver(checkoutCustomerSchema) });

  async function onSubmit(customer: CheckoutCustomerInput) {
    setSubmitError(null);
    const result = await createOrder({
      customer,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });

    if (!result.success || !result.orderNumber || !result.whatsappUrl) {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    clearCart();
    setOrderResult({ orderNumber: result.orderNumber, whatsappUrl: result.whatsappUrl });
    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
  }

  if (!mounted) return null;

  if (orderResult) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border py-16 text-center">
        <p className="font-heading text-2xl">Order #{orderResult.orderNumber} placed!</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We opened WhatsApp with your order details — send the message to confirm with our team. If it
          didn&apos;t open, use the button below.
        </p>
        <a href={orderResult.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants()}>
          Open WhatsApp
        </a>
        <Link href="/products" className="text-sm underline-offset-4 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/products" className={buttonVariants()}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="customerName">Full Name</Label>
          <Input id="customerName" className="mt-1.5" {...register("customerName")} aria-invalid={!!errors.customerName} />
          {errors.customerName && <p className="mt-1 text-xs text-destructive">{errors.customerName.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" className="mt-1.5" {...register("phone")} aria-invalid={!!errors.phone} />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" type="email" className="mt-1.5" {...register("email")} aria-invalid={!!errors.email} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="province">Province</Label>
            <Input id="province" className="mt-1.5" {...register("province")} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" className="mt-1.5" {...register("city")} aria-invalid={!!errors.city} />
            {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Delivery Address</Label>
          <Textarea id="address" className="mt-1.5" rows={3} {...register("address")} aria-invalid={!!errors.address} />
          {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
        </div>

        <div>
          <Label htmlFor="notes">Order Notes (optional)</Label>
          <Textarea id="notes" className="mt-1.5" rows={2} {...register("notes")} />
        </div>

        {submitError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}
      </div>

      <div className="h-fit rounded-xl border border-border p-5">
        <h2 className="font-heading text-lg">Order Summary</h2>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="line-clamp-1">
                {item.name} &times; {item.quantity}
              </span>
              <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-brand-sale">
              <dt>Discount</dt>
              <dd>-{formatCurrency(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{deliveryCharge > 0 ? formatCurrency(deliveryCharge) : "Free"}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatCurrency(total + deliveryCharge)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          Final pricing is confirmed by our server before your order is created.
        </p>
        <Button type="submit" className="mt-4 w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Placing Order..." : "Order via WhatsApp"}
        </Button>
      </div>
    </form>
  );
}
