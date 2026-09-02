import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/generated/prisma/client";

export function FeaturedBrands({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-heading text-2xl">Featured Brands</h2>
          <Link href="/brands" className="text-sm font-medium underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-colors hover:border-foreground/20"
            >
              {brand.logoUrl ? (
                <div className="relative h-10 w-full">
                  <Image src={brand.logoUrl} alt={brand.name} fill sizes="120px" className="object-contain" />
                </div>
              ) : (
                <span className="font-heading text-lg">{brand.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
