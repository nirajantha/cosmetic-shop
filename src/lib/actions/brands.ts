"use server";

import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";
import { brandActionSchema } from "@/lib/validations/brand";
import type { ActionResult } from "@/lib/actions/types";

function revalidateBrandPaths() {
  revalidatePath("/admin/brands");
  revalidatePath("/", "layout");
  revalidatePath("/brands");
  revalidatePath("/products");
  revalidatePath("/brands/[slug]", "page");
  updateTag("brands");
}

export async function createBrand(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = brandActionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    await db.brand.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive,
      },
    });
  } catch {
    return { success: false, error: "A brand with this name already exists." };
  }

  revalidateBrandPaths();
  return { success: true };
}

export async function updateBrand(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = brandActionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    await db.brand.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        isActive: data.isActive,
      },
    });
  } catch {
    return { success: false, error: "A brand with this name already exists." };
  }

  revalidateBrandPaths();
  return { success: true };
}

export async function toggleBrandActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.brand.update({ where: { id }, data: { isActive } });
  revalidateBrandPaths();
  return { success: true };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  await requireAdmin();

  const productCount = await db.product.count({ where: { brandId: id } });
  if (productCount > 0) {
    await db.brand.update({ where: { id }, data: { isActive: false } });
    revalidateBrandPaths();
    return { success: true, message: "This brand still has products, so it was archived instead of deleted." };
  }

  await db.brand.delete({ where: { id } });
  revalidateBrandPaths();
  return { success: true };
}
