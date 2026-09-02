import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductCardData } from "@/lib/data/products";
import type { PricingOffer } from "@/lib/pricing";

interface ProductRailProps {
  title: string;
  viewAllHref?: string;
  products: ProductCardData[];
  offers: PricingOffer[];
}

export function ProductRail({ title, viewAllHref, products, offers }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-heading text-2xl">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium underline-offset-4 hover:underline">
            View all
          </Link>
        )}
      </div>
      <ProductGrid products={products} offers={offers} />
    </section>
  );
}
