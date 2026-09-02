"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { offerActionSchema } from "@/lib/validations/offer";
import type { ActionResult } from "@/lib/actions/types";

function revalidateOfferPaths() {
  revalidatePath("/admin/offers");
  revalidatePath("/", "layout");
  revalidatePath("/offers");
  revalidatePath("/products");
}

function parseOfferFormData(formData: FormData) {
  return offerActionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    value: formData.get("value"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive"),
    bannerImage: formData.get("bannerImage"),
    targetType: formData.get("targetType"),
    brandId: formData.get("brandId") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    productIds: formData.getAll("productIds").map(String),
  });
}

function buildTargetData(data: ReturnType<typeof offerActionSchema.parse>) {
  return {
    brandId: data.targetType === "brand" ? data.brandId : null,
    categoryId: data.targetType === "category" ? data.categoryId : null,
    products:
      data.targetType === "products"
        ? { set: (data.productIds ?? []).map((id) => ({ id })) }
        : { set: [] },
  };
}

export async function createOffer(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseOfferFormData(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  await db.offer.create({
    data: {
      title: data.title,
      description: data.description || null,
      type: data.type,
      value: data.value,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      bannerImage: data.bannerImage || null,
      brandId: data.targetType === "brand" ? data.brandId : null,
      categoryId: data.targetType === "category" ? data.categoryId : null,
      products: data.targetType === "products" ? { connect: (data.productIds ?? []).map((id) => ({ id })) } : undefined,
    },
  });

  revalidateOfferPaths();
  return { success: true };
}

export async function updateOffer(id: string, formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseOfferFormData(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
  const data = parsed.data;

  await db.offer.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      type: data.type,
      value: data.value,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      bannerImage: data.bannerImage || null,
      ...buildTargetData(data),
    },
  });

  revalidateOfferPaths();
  return { success: true };
}

export async function toggleOfferActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.offer.update({ where: { id }, data: { isActive } });
  revalidateOfferPaths();
  return { success: true };
}

export async function deleteOffer(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.offer.delete({ where: { id } });
  revalidateOfferPaths();
  return { success: true };
}
