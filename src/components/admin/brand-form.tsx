"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrand, updateBrand } from "@/lib/actions/brands";
import { brandFormSchema, type BrandFormInput } from "@/lib/validations/brand";

interface BrandFormProps {
  mode: "create" | "edit";
  brandId?: string;
  defaultValues?: Partial<BrandFormInput>;
}

export function BrandForm({ mode, brandId, defaultValues }: BrandFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { isActive: true, ...defaultValues },
  });

  async function onSubmit(data: BrandFormInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("description", data.description ?? "");
    formData.set("logoUrl", data.logoUrl ?? "");
    formData.set("isActive", data.isActive ? "true" : "false");

    const result = mode === "create" ? await createBrand(formData) : await updateBrand(brandId!, formData);

    if (!result.success) {
      setServerError(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(mode === "create" ? "Brand created" : "Brand updated");
    router.push("/admin/brands");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" className="mt-1.5" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} className="mt-1.5" {...register("description")} />
      </div>

      <ImageUploadField label="Logo" value={watch("logoUrl") ?? ""} onChange={(url) => setValue("logoUrl", url)} />

      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={watch("isActive")} onCheckedChange={(checked) => setValue("isActive", checked === true)} />
        Active
      </label>

      {serverError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Brand" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
