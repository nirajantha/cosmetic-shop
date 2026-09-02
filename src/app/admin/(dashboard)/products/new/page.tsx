import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getActiveBrands } from "@/lib/data/brands";
import { getAllActiveCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getActiveBrands(), getAllActiveCategories()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">New Product</h1>
      <ProductForm
        mode="create"
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
