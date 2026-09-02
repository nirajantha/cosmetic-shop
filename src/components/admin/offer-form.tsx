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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createOffer, updateOffer } from "@/lib/actions/offers";
import { offerFormSchema, type OfferFormInput } from "@/lib/validations/offer";
import { cn } from "@/lib/utils";

interface OfferFormProps {
  mode: "create" | "edit";
  offerId?: string;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  products: { id: string; name: string; brandName: string }[];
  defaultValues?: Partial<OfferFormInput>;
}

export function OfferForm({ mode, offerId, brands, categories, products, defaultValues }: OfferFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormInput>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      isActive: true,
      type: "PERCENTAGE",
      targetType: "brand",
      productIds: [],
      ...defaultValues,
    },
  });

  const targetType = watch("targetType");
  const selectedProductIds = watch("productIds") ?? [];
  const filteredProducts = products.filter((p) =>
    `${p.name} ${p.brandName}`.toLowerCase().includes(productSearch.toLowerCase())
  );

  async function onSubmit(data: OfferFormInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("title", data.title);
    formData.set("description", data.description ?? "");
    formData.set("type", data.type);
    formData.set("value", String(data.value));
    formData.set("startDate", data.startDate);
    formData.set("endDate", data.endDate);
    formData.set("isActive", data.isActive ? "true" : "false");
    formData.set("bannerImage", data.bannerImage ?? "");
    formData.set("targetType", data.targetType);
    if (data.brandId) formData.set("brandId", data.brandId);
    if (data.categoryId) formData.set("categoryId", data.categoryId);
    for (const id of data.productIds ?? []) formData.append("productIds", id);

    const result = mode === "create" ? await createOffer(formData) : await updateOffer(offerId!, formData);

    if (!result.success) {
      setServerError(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(mode === "create" ? "Offer created" : "Offer updated");
    router.push("/admin/offers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" className="mt-1.5" {...register("title")} aria-invalid={!!errors.title} />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={2} className="mt-1.5" {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Discount Type</Label>
          <Select value={watch("type")} onValueChange={(v) => v && setValue("type", v as "PERCENTAGE" | "FIXED_AMOUNT")}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed Amount (Rs.)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            className="mt-1.5"
            {...register("value", { valueAsNumber: true })}
            aria-invalid={!!errors.value}
          />
          {errors.value && <p className="mt-1 text-xs text-destructive">{errors.value.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" className="mt-1.5" {...register("startDate")} aria-invalid={!!errors.startDate} />
          {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" className="mt-1.5" {...register("endDate")} aria-invalid={!!errors.endDate} />
          {errors.endDate && <p className="mt-1 text-xs text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <ImageUploadField
        label="Banner Image"
        value={watch("bannerImage") ?? ""}
        onChange={(url) => setValue("bannerImage", url)}
      />

      <div>
        <Label>Applies To</Label>
        <div className="mt-2 flex gap-2">
          {(["brand", "category", "products"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setValue("targetType", option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm capitalize",
                targetType === option ? "border-foreground bg-foreground text-background" : "border-border"
              )}
            >
              {option === "products" ? "Specific Products" : option}
            </button>
          ))}
        </div>

        {targetType === "brand" && (
          <div className="mt-3">
            <Select value={watch("brandId") ?? ""} onValueChange={(v) => setValue("brandId", v ?? "")}>
              <SelectTrigger className="w-full">
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
        )}

        {targetType === "category" && (
          <div className="mt-3">
            <Select value={watch("categoryId") ?? ""} onValueChange={(v) => setValue("categoryId", v ?? "")}>
              <SelectTrigger className="w-full">
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
        )}

        {targetType === "products" && (
          <div className="mt-3 flex flex-col gap-2">
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <div className="max-h-56 overflow-y-auto rounded-md border border-border p-2">
              {filteredProducts.map((product) => (
                <label key={product.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <Checkbox
                    checked={selectedProductIds.includes(product.id)}
                    onCheckedChange={(checked) => {
                      if (checked) setValue("productIds", [...selectedProductIds, product.id]);
                      else setValue("productIds", selectedProductIds.filter((id) => id !== product.id));
                    }}
                  />
                  {product.name} <span className="text-muted-foreground">({product.brandName})</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{selectedProductIds.length} selected</p>
            {errors.productIds && <p className="text-xs text-destructive">{errors.productIds.message}</p>}
          </div>
        )}
      </div>

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
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Offer" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
