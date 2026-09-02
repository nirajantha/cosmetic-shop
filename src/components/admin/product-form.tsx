"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductImagesField } from "@/components/admin/product-images-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createProduct, updateProduct } from "@/lib/actions/products";
import { productFormSchema, type ProductFormInput } from "@/lib/validations/product";

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  defaultValues?: Partial<ProductFormInput>;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export function ProductForm({ mode, productId, brands, categories, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      status: "DRAFT",
      featured: false,
      isNew: false,
      isBestSeller: false,
      stock: 0,
      images: [],
      ...defaultValues,
    },
  });

  async function onSubmit(data: ProductFormInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("sku", data.sku);
    formData.set("brandId", data.brandId);
    formData.set("categoryId", data.categoryId);
    formData.set("description", data.description);
    formData.set("shortDescription", data.shortDescription ?? "");
    formData.set("ingredients", data.ingredients ?? "");
    formData.set("howToUse", data.howToUse ?? "");
    formData.set("price", String(data.price));
    formData.set("salePrice", data.salePrice ? String(data.salePrice) : "");
    formData.set("stock", String(data.stock));
    formData.set("status", data.status);
    formData.set("featured", data.featured ? "true" : "false");
    formData.set("isNew", data.isNew ? "true" : "false");
    formData.set("isBestSeller", data.isBestSeller ? "true" : "false");
    formData.set("imagesJson", JSON.stringify(data.images));

    const result = mode === "create" ? await createProduct(formData) : await updateProduct(productId!, formData);

    if (!result.success) {
      setServerError(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(mode === "create" ? "Product created" : "Product updated");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" className="mt-1.5" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" className="mt-1.5" {...register("sku")} aria-invalid={!!errors.sku} />
          {errors.sku && <p className="mt-1 text-xs text-destructive">{errors.sku.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Brand</Label>
          <Select value={watch("brandId") ?? ""} onValueChange={(v) => setValue("brandId", v ?? "")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brandId && <p className="mt-1 text-xs text-destructive">{errors.brandId.message}</p>}
        </div>
        <div>
          <Label>Category</Label>
          <Select value={watch("categoryId") ?? ""} onValueChange={(v) => setValue("categoryId", v ?? "")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="shortDescription">Short Description</Label>
        <Textarea id="shortDescription" rows={2} className="mt-1.5" {...register("shortDescription")} />
        <p className="mt-1 text-xs text-muted-foreground">Used in product cards and search-engine snippets.</p>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={5} className="mt-1.5" {...register("description")} aria-invalid={!!errors.description} />
        {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="ingredients">Ingredients</Label>
        <Textarea id="ingredients" rows={3} className="mt-1.5" {...register("ingredients")} />
      </div>

      <div>
        <Label htmlFor="howToUse">How to Use</Label>
        <Textarea id="howToUse" rows={3} className="mt-1.5" {...register("howToUse")} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="price">Price (Rs.)</Label>
          <Input id="price" type="number" step="0.01" className="mt-1.5" {...register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} />
          {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="salePrice">Sale Price (Rs.)</Label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            className="mt-1.5"
            {...register("salePrice", { valueAsNumber: true, setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
            aria-invalid={!!errors.salePrice}
          />
          {errors.salePrice && <p className="mt-1 text-xs text-destructive">{errors.salePrice.message}</p>}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" className="mt-1.5" {...register("stock", { valueAsNumber: true })} aria-invalid={!!errors.stock} />
          {errors.stock && <p className="mt-1 text-xs text-destructive">{errors.stock.message}</p>}
        </div>
        <div>
          <Label>Status</Label>
          <Select value={watch("status")} onValueChange={(v) => v && setValue("status", v as ProductFormInput["status"])}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={watch("featured")} onCheckedChange={(c) => setValue("featured", c === true)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={watch("isNew")} onCheckedChange={(c) => setValue("isNew", c === true)} />
          New
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={watch("isBestSeller")} onCheckedChange={(c) => setValue("isBestSeller", c === true)} />
          Best Seller
        </label>
      </div>

      <ProductImagesField
        value={watch("images") ?? []}
        onChange={(images) => setValue("images", images, { shouldValidate: true })}
        error={errors.images?.message ?? errors.images?.root?.message}
      />

      {serverError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
