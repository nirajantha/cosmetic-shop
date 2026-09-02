"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "best-selling", label: "Best Selling" },
] as const;

export function ProductSortSelect({ basePath = "/products" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "featured";

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger aria-label="Sort products" className="w-full sm:w-56">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
