import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getActiveBrands } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "All Brands",
  description: "Browse every authentic beauty brand available at Aurelle.",
};

export default async function BrandsPage() {
  const brands = await getActiveBrands();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Brands" }]} />
      <h1 className="mt-4 font-heading text-3xl">All Brands</h1>
      <p className="mt-1 text-sm text-muted-foreground">{brands.length} brands</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="flex flex-col items-center gap-3 rounded-xl border border-border p-6 text-center transition-colors hover:border-foreground/20 hover:bg-secondary/40"
          >
            {brand.logoUrl ? (
              <div className="relative h-12 w-full">
                <Image src={brand.logoUrl} alt={brand.name} fill sizes="150px" className="object-contain" />
              </div>
            ) : (
              <span className="font-heading text-xl">{brand.name}</span>
            )}
            {brand.description && <p className="line-clamp-2 text-xs text-muted-foreground">{brand.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
