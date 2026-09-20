"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatCurrency } from "@/lib/utils";
import { selectDiscount, selectSubtotal, selectTotal, useCartStore } from "@/store/cart-store";

export function CartView() {
  const mounted = useHydrated();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectSubtotal);
  const discount = useCartStore(selectDiscount);
  const total = useCartStore(selectTotal);
  const { incrementItem, decrementItem, removeItem } = useCartStore();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground">Browse our catalog and add something you&apos;ll love.</p>
        <Link href="/products" className={buttonVariants()}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col divide-y divide-border">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 py-5">
            <Link href={`/products/${item.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              ) : null}
            </Link>

            <div className="flex flex-1 flex-col gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{item.brandName}</p>
              <Link href={`/products/${item.slug}`} className="text-sm font-medium">
                {item.name}
              </Link>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-medium">{formatCurrency(item.price)}</span>
                {item.price < item.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center rounded-lg border border-input">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => decrementItem(item.productId)}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm" aria-live="polite">
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() => incrementItem(item.productId)}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="h-fit rounded-xl border border-border p-5">
        <h2 className="font-heading text-lg">Order Summary</h2>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
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
          <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">Delivery charges are calculated at checkout.</p>
        <Link href="/checkout" className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}>
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
