"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { url: string; alt: string }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt}
            fill
            preload
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            No image available
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${productName}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2",
                index === activeIndex ? "border-foreground" : "border-transparent"
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
