"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validations/category";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormProps {
  mode: "create" | "edit";
  categoryId?: string;
  parentOptions: { id: string; name: string }[];
  defaultValues?: Partial<CategoryFormInput>;
}

export function CategoryForm({ mode, categoryId, parentOptions, defaultValues }: CategoryFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { isActive: true, sortOrder: 0, ...defaultValues },
  });

  async function onSubmit(data: CategoryFormInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("description", data.description ?? "");
    formData.set("image", data.image ?? "");
    formData.set("parentId", data.parentId ?? "");
    formData.set("sortOrder", String(data.sortOrder));
    formData.set("isActive", data.isActive ? "true" : "false");

    const result =
      mode === "create" ? await createCategory(formData) : await updateCategory(categoryId!, formData);

    if (!result.success) {
      setServerError(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(mode === "create" ? "Category created" : "Category updated");
    router.push("/admin/categories");
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

      <ImageUploadField label="Image" value={watch("image") ?? ""} onChange={(url) => setValue("image", url)} />

      <div>
        <Label>Parent Category</Label>
        <Select
          value={watch("parentId") || "none"}
          onValueChange={(value) => setValue("parentId", !value || value === "none" ? "" : value)}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue placeholder="None (top-level category)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (top-level category)</SelectItem>
            {parentOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" type="number" className="mt-1.5" {...register("sortOrder", { valueAsNumber: true })} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked === true)}
            />
            Active
          </label>
        </div>
      </div>

      {serverError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Category" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
