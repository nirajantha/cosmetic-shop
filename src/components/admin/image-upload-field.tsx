"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({ label, value, onChange }: ImageUploadFieldProps) {
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
      onChange(data.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1.5 flex items-center gap-3">
        {value ? (
          <div className="relative size-20 overflow-hidden rounded-lg border border-border">
            <Image src={value} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-foreground/80 text-background"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
            <ImagePlus className="size-6" aria-hidden="true" />
          </div>
        )}

        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : "Upload"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
