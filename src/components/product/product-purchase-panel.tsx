"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Button } from "@/components/ui/button";

interface ProductPurchasePanelProps {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  image: string | null;
  price: number;
  originalPrice: number;
  stock: number;
  isOutOfStock: boolean;
}

export function ProductPurchasePanel(props: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = Math.max(1, props.stock);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex w-fit items-center rounded-lg border border-input">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={props.isOutOfStock || quantity <= 1}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-10 text-center text-sm font-medium" aria-live="polite">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={props.isOutOfStock || quantity >= maxQuantity}
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <AddToCartButton {...props} quantity={quantity} size="lg" fullLabel className="flex-1 sm:flex-initial" />
    </div>
  );
}
