import type { Prisma } from "@/generated/prisma/client";
import { db, withRetry } from "@/lib/db";

const CATEGORY_TREE_INCLUDE = {
  children: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.CategoryInclude;

export type CategoryTree = Prisma.CategoryGetPayload<{ include: typeof CATEGORY_TREE_INCLUDE }>[];

export async function getCategoryTree(): Promise<CategoryTree> {
  return withRetry(() =>
    db.category.findMany({
      where: { parentId: null, isActive: true },
      include: CATEGORY_TREE_INCLUDE,
      orderBy: { sortOrder: "asc" },
    })
  );
}

export async function getAllActiveCategories() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: { slug, isActive: true },
    include: { parent: true, children: { where: { isActive: true } } },
  });
}

/** A category's own id plus every descendant id — for "show all products under this branch". */
export async function getCategoryIdsInBranch(categoryId: string): Promise<string[]> {
  const children = await db.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });
  return [categoryId, ...children.map((c) => c.id)];
}

export async function getAllCategoriesForAdmin() {
  return db.category.findMany({
    include: { parent: { select: { name: true } }, _count: { select: { products: true, children: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
