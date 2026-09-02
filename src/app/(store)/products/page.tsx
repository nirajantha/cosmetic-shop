import type { Metadata } from "next";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/layout/breadcrumbs";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { ProductSortSelect } from "@/components/product/product-sort-select";
import { getActiveBrands } from "@/lib/data/brands";
import { getAllActiveCategories } from "@/lib/data/categories";
import { getLiveOffersForPricing } from "@/lib/data/offers";
import { getProducts, type ProductSort } from "@/lib/data/products";

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const parts: string[] = [];
  if (params.category) parts.push(params.category.replace(/-/g, " "));
  if (params.brand) parts.push(params.brand.replace(/-/g, " "));
  if (params.search) parts.push(`"${params.search}"`);

  const title = parts.length > 0 ? `${parts.join(" · ")} Products` : "Shop All Products";

  return {
    title,
    description:
      "Browse authentic makeup, skincare, hair and body products with fast delivery and unbeatable prices.",
    alternates: { canonical: `${siteUrl}/products` },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const sort = params.sort as ProductSort | undefined;
  const page = params.page ? Number(params.page) : 1;

  const [{ products, total, totalPages }, categories, brands, activeOffers] = await Promise.all([
    getProducts({
      category: params.category,
      brand: params.brand,
      search: params.search,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      availability: params.availability as "in-stock" | "out-of-stock" | undefined,
      onSale: params.onSale === "true",
      isNew: params.isNew === "true",
      isBestSeller: params.isBestSeller === "true",
      sort,
      page,
    }),
    getAllActiveCategories(),
    getActiveBrands(),
    getLiveOffersForPricing(),
  ]);

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([{ label: "Shop" }], siteUrl)) }}
      />
      <Breadcrumbs items={[{ label: "Shop" }]} />

      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl">All Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} product{total === 1 ? "" : "s"}</p>
        </div>
        <ProductSortSelect />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters
            categories={rootCategories.map((c) => ({ slug: c.slug, name: c.name }))}
            brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
          />
        </aside>

        <div>
          <details className="mb-4 rounded-lg border border-border p-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">Filters</summary>
            <div className="mt-4">
              <ProductFilters
                categories={rootCategories.map((c) => ({ slug: c.slug, name: c.name }))}
                brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
              />
            </div>
          </details>

          <ProductGrid products={products} offers={activeOffers} emptyMessage="No products match your filters." />
          <ProductPagination page={page} totalPages={totalPages} searchParams={params} />
        </div>
      </div>
    </div>
  );
}
