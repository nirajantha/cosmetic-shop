import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";
import { getAllActiveCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "New Category" };

export default async function NewCategoryPage() {
  const categories = await getAllActiveCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">New Category</h1>
      <CategoryForm mode="create" parentOptions={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
