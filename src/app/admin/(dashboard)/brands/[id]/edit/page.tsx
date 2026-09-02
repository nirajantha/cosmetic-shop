import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/brand-form";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Edit Brand" };

interface EditBrandPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params;
  const brand = await db.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Edit Brand</h1>
      <BrandForm
        mode="edit"
        brandId={brand.id}
        defaultValues={{
          name: brand.name,
          description: brand.description ?? "",
          logoUrl: brand.logoUrl ?? "",
          isActive: brand.isActive,
        }}
      />
    </div>
  );
}
