import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { db } from "@/lib/db";
import { getAllActiveCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Edit Category" };

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const [category, categories] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    getAllActiveCategories(),
  ]);
  if (!category) notFound();

  const parentOptions = categories.filter((c) => c.id !== category.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Edit Category</h1>
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        parentOptions={parentOptions.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          name: category.name,
          description: category.description ?? "",
          image: category.image ?? "",
          parentId: category.parentId ?? "",
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
      />
    </div>
  );
}
