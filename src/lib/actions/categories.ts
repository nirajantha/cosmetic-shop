"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";
import { categoryActionSchema } from "@/lib/validations/category";
import type { ActionResult } from "@/lib/actions/types";

export type { ActionResult };

async function isDescendant(categoryId: string, potentialAncestorId: string): Promise<boolean> {
  let current = await db.category.findUnique({ where: { id: categoryId }, select: { parentId: true } });
  while (current?.parentId) {
    if (current.parentId === potentialAncestorId) return true;
    current = await db.category.findUnique({ where: { id: current.parentId }, select: { parentId: true } });
  }
  return false;
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/categories/[slug]", "page");
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categoryActionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    await db.category.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  } catch {
    return { success: false, error: "A category with this name already exists." };
  }

  revalidateCategoryPaths();
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categoryActionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  if (data.parentId) {
    if (data.parentId === id) return { success: false, error: "A category cannot be its own parent." };
    if (await isDescendant(data.parentId, id)) {
      return { success: false, error: "Cannot select a subcategory as the parent — this would create a loop." };
    }
  }

  try {
    await db.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
  } catch {
    return { success: false, error: "A category with this name already exists." };
  }

  revalidateCategoryPaths();
  return { success: true };
}

export async function toggleCategoryActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.category.update({ where: { id }, data: { isActive } });
  revalidateCategoryPaths();
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();

  const [productCount, childCount] = await Promise.all([
    db.product.count({ where: { categoryId: id } }),
    db.category.count({ where: { parentId: id } }),
  ]);

  if (productCount > 0 || childCount > 0) {
    await db.category.update({ where: { id }, data: { isActive: false } });
    revalidateCategoryPaths();
    return {
      success: true,
      message: "This category still has products or subcategories, so it was archived instead of deleted.",
    };
  }

  await db.category.delete({ where: { id } });
  revalidateCategoryPaths();
  return { success: true };
}
