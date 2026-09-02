import type { Metadata } from "next";
import { BrandForm } from "@/components/admin/brand-form";

export const metadata: Metadata = { title: "New Brand" };

export default function NewBrandPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">New Brand</h1>
      <BrandForm mode="create" />
    </div>
  );
}
