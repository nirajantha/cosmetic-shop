import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getCategoryIdsInBranch } from "@/lib/data/categories";

export const PRODUCT_CARD_INCLUDE = {
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
} satisfies Prisma.ProductInclude;

export const PRODUCT_DETAIL_INCLUDE = {
  brand: true,
  category: { include: { parent: true } },
  images: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type ProductSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "best-selling";

export interface ProductListFilters {
  category?: string;
  brand?: string;
  productIds?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: "in-stock" | "out-of-stock";
  onSale?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 12;

function buildOrderBy(sort: ProductSort = "featured"): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "name-asc":
      return [{ name: "asc" }];
    case "best-selling":
      return [{ isBestSeller: "desc" }, { createdAt: "desc" }];
    case "featured":
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

export async function getProducts(filters: ProductListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {
    status: { in: ["ACTIVE", "OUT_OF_STOCK"] },
  };

  if (filters.productIds) {
    where.id = { in: filters.productIds };
  }

  if (filters.category) {
    const category = await db.category.findFirst({
      where: { slug: filters.category, isActive: true },
      select: { id: true },
    });
    if (!category) {
      return { products: [], total: 0, page, pageSize, totalPages: 0 };
    }
    const categoryIds = await getCategoryIdsInBranch(category.id);
    where.categoryId = { in: categoryIds };
  }

  if (filters.brand) {
    const brand = await db.brand.findFirst({ where: { slug: filters.brand, isActive: true }, select: { id: true } });
    if (!brand) {
      return { products: [], total: 0, page, pageSize, totalPages: 0 };
    }
    where.brandId = brand.id;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { sku: { contains: filters.search } },
      { brand: { name: { contains: filters.search } } },
    ];
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.availability === "in-stock") {
    where.status = "ACTIVE";
    where.stock = { gt: 0 };
  } else if (filters.availability === "out-of-stock") {
    where.OR = [...(where.OR ?? []), { status: "OUT_OF_STOCK" }, { stock: { lte: 0 } }];
  }

  if (filters.onSale) {
    where.salePrice = { not: null };
  }

  if (filters.isNew) {
    where.isNew = true;
  }

  if (filters.isBestSeller) {
    where.isBestSeller = true;
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: PRODUCT_CARD_INCLUDE,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, status: { in: ["ACTIVE", "OUT_OF_STOCK"] } },
    include: PRODUCT_DETAIL_INCLUDE,
  });
}

export async function getRelatedProducts(product: { id: string; categoryId: string }, limit = 4) {
  return db.product.findMany({
    where: {
      id: { not: product.id },
      categoryId: product.categoryId,
      status: { in: ["ACTIVE", "OUT_OF_STOCK"] },
    },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { featured: true, status: "ACTIVE" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNewArrivals(limit = 8) {
  return db.product.findMany({
    where: { isNew: true, status: "ACTIVE" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getBestSellers(limit = 8) {
  return db.product.findMany({
    where: { isBestSeller: true, status: "ACTIVE" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getDiscountedProducts(limit = 8) {
  return db.product.findMany({
    where: { salePrice: { not: null }, status: "ACTIVE" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof PRODUCT_CARD_INCLUDE }>;
export type ProductDetailData = Prisma.ProductGetPayload<{ include: typeof PRODUCT_DETAIL_INCLUDE }>;
