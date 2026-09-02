"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MAIN_NAV_LINKS, SITE_NAME } from "@/lib/constants";
import type { CategoryTree } from "@/lib/data/categories";

export function MobileNav({ categoryTree }: { categoryTree: CategoryTree }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">{SITE_NAME}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-8" aria-label="Mobile">
          {MAIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 border-t border-border pt-2">
            <p className="px-2 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Categories
            </p>
            {categoryTree.map((category) => (
              <details key={category.id} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2.5 text-sm font-medium hover:bg-muted">
                  <Link href={`/categories/${category.slug}`} onClick={() => setOpen(false)}>
                    {category.name}
                  </Link>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="flex flex-col pl-4">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
