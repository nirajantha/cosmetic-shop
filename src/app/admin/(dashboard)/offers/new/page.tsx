import type { Metadata } from "next";
import { OfferForm } from "@/components/admin/offer-form";
import { getActiveBrands } from "@/lib/data/brands";
import { getAllActiveCategories } from "@/lib/data/categories";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "New Offer" };

export default async function NewOfferPage() {
  const [brands, categories, products] = await Promise.all([
    getActiveBrands(),
    getAllActiveCategories(),
    db.product.findMany({
      where: { status: { not: "ARCHIVED" } },
      select: { id: true, name: true, brand: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">New Offer</h1>
      <OfferForm
        mode="create"
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        products={products.map((p) => ({ id: p.id, name: p.name, brandName: p.brand.name }))}
      />
    </div>
  );
}
