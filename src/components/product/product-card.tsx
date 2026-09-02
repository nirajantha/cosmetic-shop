import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductBadges } from "@/components/product/product-badges";
import type { ProductCardData } from "@/lib/data/products";
import type { PricingOffer } from "@/lib/pricing";
import { calculateEffectivePrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: ProductCardData;
  offers: PricingOffer[];
}

export function ProductCard({ product, offers }: ProductCardProps) {
  const pricing = calculateEffectivePrice(product, offers);
  const isOutOfStock = product.status === "OUT_OF_STOCK" || product.stock <= 0;
  const image = product.images[0];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        <ProductBadges
          isNew={product.isNew}
          isOutOfStock={isOutOfStock}
          discountPercent={pricing.discountPercent}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link
          href={`/brands/${product.brand.slug}`}
          className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
        >
          {product.brand.name}
        </Link>
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-medium text-foreground">
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-base font-semibold">{formatCurrency(pricing.effectivePrice)}</span>
            {pricing.isOnSale && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(pricing.originalPrice)}
              </span>
            )}
          </div>
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            brandName={product.brand.name}
            image={image?.url ?? null}
            price={pricing.effectivePrice}
            originalPrice={pricing.originalPrice}
            stock={product.stock}
            isOutOfStock={isOutOfStock}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
