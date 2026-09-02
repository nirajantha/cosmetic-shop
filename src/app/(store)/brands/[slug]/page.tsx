import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/layout/breadcrumbs";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { ProductSortSelect } from "@/components/product/product-sort-select";
import { getBrandBySlug } from "@/lib/data/brands";
import { getAllActiveCategories } from "@/lib/data/categories";
import { getLiveOffersForPricing } from "@/lib/data/offers";
import { getProducts, type ProductSort } from "@/lib/data/products";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Brand Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const description =
    brand.description ?? `Shop authentic ${brand.name} products at Aurelle with fast, reliable delivery.`;

  return {
    title: `${brand.name} Products`,
    description,
    alternates: { canonical: `${siteUrl}/brands/${brand.slug}` },
    openGraph: { title: `${brand.name} Products`, description, url: `${siteUrl}/brands/${brand.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const sort = query.sort as ProductSort | undefined;
  const page = query.page ? Number(query.page) : 1;
  const basePath = `/brands/${slug}`;

  const [{ products, total, totalPages }, categories, activeOffers] = await Promise.all([
    getProducts({
      brand: slug,
      category: query.category,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      availability: query.availability as "in-stock" | "out-of-stock" | undefined,
      onSale: query.onSale === "true",
      isNew: query.isNew === "true",
      isBestSeller: query.isBestSeller === "true",
      sort,
      page,
    }),
    getAllActiveCategories(),
    getLiveOffersForPricing(),
  ]);

  const rootCategories = categories.filter((c) => !c.parentId);
  const breadcrumbItems = [{ label: "Brands", href: "/brands" }, { label: brand.name }];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems, siteUrl)) }}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl">{brand.name}</h1>
          {brand.description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{brand.description}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{total} product{total === 1 ? "" : "s"}</p>
        </div>
        <ProductSortSelect basePath={basePath} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters
            categories={rootCategories.map((c) => ({ slug: c.slug, name: c.name }))}
            brands={[]}
            basePath={basePath}
          />
        </aside>

        <div>
          <details className="mb-4 rounded-lg border border-border p-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">Filters</summary>
            <div className="mt-4">
              <ProductFilters
                categories={rootCategories.map((c) => ({ slug: c.slug, name: c.name }))}
                brands={[]}
                basePath={basePath}
              />
            </div>
          </details>

          <ProductGrid products={products} offers={activeOffers} emptyMessage="No products from this brand yet." />
          <ProductPagination page={page} totalPages={totalPages} searchParams={query} basePath={basePath} />
        </div>
      </div>
    </div>
  );
}
