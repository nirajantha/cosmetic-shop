import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfferForm } from "@/components/admin/offer-form";
import { getActiveBrands } from "@/lib/data/brands";
import { getAllActiveCategories } from "@/lib/data/categories";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit Offer" };

interface EditOfferPageProps {
  params: Promise<{ id: string }>;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const { id } = await params;
  const [offer, brands, categories, products] = await Promise.all([
    db.offer.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    getActiveBrands(),
    getAllActiveCategories(),
    db.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, name: true, brand: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!offer) notFound();

  const targetType = offer.brandId ? "brand" : offer.categoryId ? "category" : "products";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Edit Offer</h1>
      <OfferForm
        mode="edit"
        offerId={offer.id}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        products={products.map((p) => ({ id: p.id, name: p.name, brandName: p.brand.name }))}
        defaultValues={{
          title: offer.title,
          description: offer.description ?? "",
          type: offer.type,
          value: Number(offer.value),
          startDate: toDateInputValue(offer.startDate),
          endDate: toDateInputValue(offer.endDate),
          isActive: offer.isActive,
          bannerImage: offer.bannerImage ?? "",
          targetType,
          brandId: offer.brandId ?? undefined,
          categoryId: offer.categoryId ?? undefined,
          productIds: offer.products.map((p) => p.id),
        }}
      />
    </div>
  );
}
