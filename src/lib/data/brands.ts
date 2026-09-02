import { db } from "@/lib/db";

export async function getActiveBrands() {
  return db.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getFeaturedBrands(limit = 8) {
  return db.brand.findMany({
    where: { isActive: true, products: { some: { status: "ACTIVE" } } },
    orderBy: { name: "asc" },
    take: limit,
  });
}

export async function getBrandBySlug(slug: string) {
  return db.brand.findFirst({ where: { slug, isActive: true } });
}

export async function getAllBrandsForAdmin() {
  return db.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}
