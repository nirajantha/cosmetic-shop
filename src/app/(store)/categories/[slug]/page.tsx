import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/layout/breadcrumbs";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { ProductSortSelect } from "@/components/product/product-sort-select";
import { Badge } from "@/components/ui/badge";
import { getActiveBrands } from "@/lib/data/brands";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getLiveOffersForPricing } from "@/lib/data/offers";
import { getProducts, type ProductSort } from "@/lib/data/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const description =
    category.description ??
    `Shop ${category.name} at Aurelle — authentic products, competitive pricing and convenient delivery.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: `${siteUrl}/categories/${category.slug}` },
    openGraph: {
      title: category.name,
      description,
      url: `${siteUrl}/categories/${category.slug}`,
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description,
      images: category.image ? [category.image] : undefined,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const sort = query.sort as ProductSort | undefined;
  const page = query.page ? Number(query.page) : 1;
  const basePath = `/categories/${slug}`;

  const [{ products, total, totalPages }, brands, activeOffers] = await Promise.all([
    getProducts({
      category: slug,
      brand: query.brand,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      availability: query.availability as "in-stock" | "out-of-stock" | undefined,
      onSale: query.onSale === "true",
      isNew: query.isNew === "true",
      isBestSeller: query.isBestSeller === "true",
      sort,
      page,
    }),
    getActiveBrands(),
    getLiveOffersForPricing(),
  ]);

  const breadcrumbItems = [
    ...(category.parent ? [{ label: category.parent.name, href: `/categories/${category.parent.slug}` }] : []),
    { label: category.name },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems, siteUrl)) }}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl">{category.name}</h1>
          {category.description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{total} product{total === 1 ? "" : "s"}</p>
        </div>
        <ProductSortSelect basePath={basePath} />
      </div>

      {category.children.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link key={child.id} href={`/categories/${child.slug}`}>
              <Badge variant="secondary" className="cursor-pointer">
                {child.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters
            categories={[]}
            brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
            basePath={basePath}
            showCategoryFilter={false}
          />
        </aside>

        <div>
          <details className="mb-4 rounded-lg border border-border p-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold">Filters</summary>
            <div className="mt-4">
              <ProductFilters
                categories={[]}
                brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
                basePath={basePath}
                showCategoryFilter={false}
              />
            </div>
          </details>

          <ProductGrid products={products} offers={activeOffers} emptyMessage="No products in this category yet." />
          <ProductPagination page={page} totalPages={totalPages} searchParams={query} basePath={basePath} />
        </div>
      </div>
    </div>
  );
}
