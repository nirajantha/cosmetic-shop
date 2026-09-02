import { unstable_cache } from "next/cache";
import { db, withRetry } from "@/lib/db";

export const getActiveBrands = unstable_cache(
  () =>
    withRetry(() =>
      db.brand.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      })
    ),
  ["active-brands"],
  { tags: ["brands"], revalidate: 300 }
);

export const getFeaturedBrands = unstable_cache(
  (limit = 8) =>
    withRetry(() =>
      db.brand.findMany({
        where: { isActive: true, products: { some: { status: "ACTIVE" } } },
        orderBy: { name: "asc" },
        take: limit,
      })
    ),
  ["featured-brands"],
  { tags: ["brands"], revalidate: 300 }
);

export async function getBrandBySlug(slug: string) {
  return db.brand.findFirst({ where: { slug, isActive: true } });
}

export async function getAllBrandsForAdmin() {
  return db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}
