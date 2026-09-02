import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import type { ProductCardData } from "@/lib/data/products";
import type { PricingOffer } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductCardData[];
  offers: PricingOffer[];
  className?: string;
  emptyMessage?: string;
}

export function ProductGrid({ products, offers, className, emptyMessage }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "No products found."}
      </p>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} offers={offers} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
