import Image from "next/image";
import Link from "next/link";
import type { CategoryTree } from "@/lib/data/categories";

export function ShopByCategory({ categories }: { categories: CategoryTree }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-heading text-2xl">Shop by Category</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-border p-4 text-center transition-colors hover:border-foreground/20 hover:bg-secondary/40"
          >
            <div className="relative size-16 overflow-hidden rounded-full bg-muted sm:size-20">
              <Image
                src={category.image ?? `https://picsum.photos/seed/${category.slug}/200/200`}
                alt={category.name}
                fill
                sizes="80px"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
