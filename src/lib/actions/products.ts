"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/utils";
import { productActionSchema } from "@/lib/validations/product";
import type { ActionResult } from "@/lib/actions/types";

function revalidateProductPaths(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  revalidatePath("/products");
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/brands/[slug]", "page");
}

function parseProductFormData(formData: FormData) {
  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("imagesJson") ?? "[]"));
  } catch {
    images = [];
  }

  return productActionSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    ingredients: formData.get("ingredients"),
    howToUse: formData.get("howToUse"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    stock: formData.get("stock"),
    status: formData.get("status"),
    featured: formData.get("featured"),
    isNew: formData.get("isNew"),
    isBestSeller: formData.get("isBestSeller"),
    images,
  });
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseProductFormData(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const product = await db.product.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        sku: data.sku,
        brandId: data.brandId,
        categoryId: data.categoryId,
        description: data.description,
        shortDescription: data.shortDescription || null,
        ingredients: data.ingredients || null,
        howToUse: data.howToUse || null,
        price: data.price,
        salePrice: data.salePrice ?? null,
        stock: data.stock,
        status: data.status,
        featured: data.featured,
        isNew: data.isNew,
        isBestSeller: data.isBestSeller,
        images: {
          create: data.images.map((img, index) => ({ url: img.url, alt: img.alt, sortOrder: index })),
        },
      },
    });
    revalidateProductPaths(product.slug);
  } catch {
    return { success: false, error: "A product with this name or SKU already exists." };
  }

  return { success: true };
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseProductFormData(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  try {
    const product = await db.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku,
          brandId: data.brandId,
          categoryId: data.categoryId,
          description: data.description,
          shortDescription: data.shortDescription || null,
          ingredients: data.ingredients || null,
          howToUse: data.howToUse || null,
          price: data.price,
          salePrice: data.salePrice ?? null,
          stock: data.stock,
          status: data.status,
          featured: data.featured,
          isNew: data.isNew,
          isBestSeller: data.isBestSeller,
          images: {
            create: data.images.map((img, index) => ({ url: img.url, alt: img.alt, sortOrder: index })),
          },
        },
      });
    });
    revalidateProductPaths(product.slug);
  } catch {
    return { success: false, error: "A product with this name or SKU already exists." };
  }

  return { success: true };
}

export async function toggleProductFlag(
  id: string,
  flag: "featured" | "isNew" | "isBestSeller",
  value: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const product = await db.product.update({ where: { id }, data: { [flag]: value } });
  revalidateProductPaths(product.slug);
  return { success: true };
}

export async function archiveProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const product = await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateProductPaths(product.slug);
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();

  const orderItemCount = await db.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    const product = await db.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    revalidateProductPaths(product.slug);
    return { success: true, message: "This product has order history, so it was archived instead of deleted." };
  }

  const product = await db.product.delete({ where: { id } });
  revalidateProductPaths(product.slug);
  return { success: true };
}
