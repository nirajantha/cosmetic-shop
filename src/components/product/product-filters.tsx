"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterOption {
  slug: string;
  name: string;
}

interface ProductFiltersProps {
  categories: FilterOption[];
  brands: FilterOption[];
  basePath?: string;
  showCategoryFilter?: boolean;
}

export function ProductFilters({
  categories,
  brands,
  basePath = "/products",
  showCategoryFilter = true,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeBrand = searchParams.get("brand");
  const inStockOnly = searchParams.get("availability") === "in-stock";
  const onSale = searchParams.get("onSale") === "true";
  const isNew = searchParams.get("isNew") === "true";
  const isBestSeller = searchParams.get("isBestSeller") === "true";

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function toggleSingleValue(key: string, value: string) {
    updateParams((params) => {
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
  }

  function toggleBoolean(key: string, checked: boolean) {
    updateParams((params) => {
      if (checked) {
        params.set(key, "true");
      } else {
        params.delete(key);
      }
    });
  }

  function applyPriceRange() {
    updateParams((params) => {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    });
  }

  function clearAll() {
    router.push(basePath);
  }

  const hasActiveFilters =
    activeCategory || activeBrand || inStockOnly || onSale || isNew || isBestSeller || minPrice || maxPrice;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </div>

      {showCategoryFilter && categories.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Category
          </legend>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => toggleSingleValue("category", category.slug)}
              className={cn(
                "w-fit rounded-md px-1.5 py-1 text-left text-sm hover:text-foreground",
                activeCategory === category.slug ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {category.name}
            </button>
          ))}
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Brand</legend>
        {brands.map((brand) => (
          <button
            key={brand.slug}
            type="button"
            onClick={() => toggleSingleValue("brand", brand.slug)}
            className={cn(
              "w-fit rounded-md px-1.5 py-1 text-left text-sm hover:text-foreground",
              activeBrand === brand.slug ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
          >
            {brand.name}
          </button>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Price Range (Rs.)
        </legend>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={applyPriceRange}>
          Apply
        </Button>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Availability
        </legend>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) =>
              updateParams((params) => {
                if (checked === true) params.set("availability", "in-stock");
                else params.delete("availability");
              })
            }
          />
          In Stock Only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={onSale} onCheckedChange={(checked) => toggleBoolean("onSale", checked === true)} />
          On Sale
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isNew} onCheckedChange={(checked) => toggleBoolean("isNew", checked === true)} />
          New Arrivals
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isBestSeller}
            onCheckedChange={(checked) => toggleBoolean("isBestSeller", checked === true)}
          />
          Best Sellers
        </label>
      </fieldset>
    </div>
  );
}
