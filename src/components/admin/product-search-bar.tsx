"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "ARCHIVED", label: "Archived" },
];

export function ProductSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`/admin/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams((params) => {
      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <Input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(value) =>
          updateParams((params) => {
            if (value && value !== "all") params.set("status", value);
            else params.delete("status");
          })
        }
      >
        <SelectTrigger className="w-full sm:w-48">
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
  );
}
