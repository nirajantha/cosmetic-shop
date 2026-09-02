"use client";

import { ArrowDown, ArrowUp, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ProductImageValue {
  url: string;
  alt: string;
}

interface ProductImagesFieldProps {
  value: ProductImageValue[];
  onChange: (images: ProductImageValue[]) => void;
  error?: string;
}

export function ProductImagesField({ value, onChange, error }: ProductImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      onChange([...value, { url: data.url, alt: "" }]);
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateAlt(index: number, alt: string) {
    onChange(value.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <p className="text-sm font-medium">Product Images</p>
      <p className="text-xs text-muted-foreground">
        The first image is used as the primary thumbnail. Alt text is required for accessibility and SEO.
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {value.map((image, index) => (
          <div key={image.url + index} className="flex items-center gap-3 rounded-lg border border-border p-2">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <Input
              placeholder="Alt text (e.g. COSRX Snail Mucin Essence)"
              value={image.alt}
              onChange={(e) => updateAlt(index, e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, 1)}
                disabled={index === value.length - 1}
                aria-label="Move down"
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeImage(index)} aria-label="Remove image">
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        Add Image
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
