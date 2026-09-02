"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface AddToCartButtonProps {
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  image: string | null;
  price: number;
  originalPrice: number;
  stock: number;
  isOutOfStock: boolean;
  quantity?: number;
  className?: string;
  size?: "default" | "sm" | "lg";
  fullLabel?: boolean;
}

export function AddToCartButton({
  productId,
  slug,
  name,
  brandName,
  image,
  price,
  originalPrice,
  stock,
  isOutOfStock,
  quantity = 1,
  className,
  size = "default",
  fullLabel = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const disabled = isOutOfStock || stock <= 0;

  function handleAddToCart() {
    addItem(
      { productId, slug, name, brandName, image, price, originalPrice, maxStock: stock },
      quantity
    );
    toast.success(`${name} added to cart`);
  }

  return (
    <Button
      type="button"
      size={size}
      disabled={disabled}
      onClick={handleAddToCart}
      className={cn("gap-1.5", className)}
      aria-label={disabled ? `${name} is out of stock` : `Add ${name} to cart`}
    >
      <ShoppingBag className="size-4" aria-hidden="true" />
      {disabled ? "Out of Stock" : fullLabel ? "Add to Cart" : "Add"}
    </Button>
  );
}
