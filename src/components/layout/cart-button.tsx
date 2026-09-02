"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useHydrated } from "@/hooks/use-hydrated";
import { selectItemCount, useCartStore } from "@/store/cart-store";

export function CartButton() {
  // Avoid a hydration mismatch: the persisted cart count is only known client-side.
  const mounted = useHydrated();
  const itemCount = useCartStore(selectItemCount);

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${mounted ? itemCount : 0} item${itemCount === 1 ? "" : "s"}`}
      className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
