import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/layout/breadcrumbs";
import { ProductBadges } from "@/components/product/product-badges";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfoTabs } from "@/components/product/product-info-tabs";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductRail } from "@/components/store/product-rail";
import { getLiveOffersForPricing } from "@/lib/data/offers";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { calculateEffectivePrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const description =
    product.shortDescription ??
    `Shop ${product.name} by ${product.brand.name} with authentic products, competitive pricing and convenient delivery.`;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `${siteUrl}/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${product.brand.name}`,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      images: image ? [{ url: image, alt: product.images[0]!.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${product.brand.name}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [activeOffers, relatedProducts] = await Promise.all([
    getLiveOffersForPricing(),
    getRelatedProducts(product),
  ]);

  const pricing = calculateEffectivePrice(product, activeOffers);
  const isOutOfStock = product.status === "OUT_OF_STOCK" || product.stock <= 0;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const productUrl = `${siteUrl}/products/${product.slug}`;

  const breadcrumbItems = [
    ...(product.category.parent
      ? [{ label: product.category.parent.name, href: `/categories/${product.category.parent.slug}` }]
      : []),
    { label: product.category.name, href: `/categories/${product.category.slug}` },
    { label: product.brand.name, href: `/brands/${product.brand.slug}` },
    { label: product.name },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    image: product.images.map((img) => img.url),
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand.name },
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "NPR",
      price: pricing.effectivePrice.toFixed(2),
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems, siteUrl)) }}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {product.brand.name}
            </p>
            <h1 className="mt-1 font-heading text-3xl">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <ProductBadges isNew={product.isNew} isOutOfStock={isOutOfStock} discountPercent={pricing.discountPercent} />
            <span className="font-heading text-2xl font-semibold">{formatCurrency(pricing.effectivePrice)}</span>
            {pricing.isOnSale && (
              <span className="text-base text-muted-foreground line-through">
                {formatCurrency(pricing.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {isOutOfStock ? "Currently out of stock" : `${product.stock} in stock`}
          </p>

          {product.shortDescription && <p className="text-sm text-muted-foreground">{product.shortDescription}</p>}

          <ProductPurchasePanel
            productId={product.id}
            slug={product.slug}
            name={product.name}
            brandName={product.brand.name}
            image={product.images[0]?.url ?? null}
            price={pricing.effectivePrice}
            originalPrice={pricing.originalPrice}
            stock={product.stock}
            isOutOfStock={isOutOfStock}
          />

          <div className="mt-4">
            <ProductInfoTabs
              description={product.description}
              ingredients={product.ingredients}
              howToUse={product.howToUse}
            />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <ProductRail title="You May Also Like" products={relatedProducts} offers={activeOffers} />
      )}
    </div>
  );
}
