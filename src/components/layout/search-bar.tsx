"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        name="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products, brands, SKU..."
        aria-label="Search products"
        className="pl-9"
      />
    </form>
  );
}
