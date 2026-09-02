import Link from "next/link";
import { Suspense } from "react";
import { CartButton } from "@/components/layout/cart-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchBar } from "@/components/layout/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategoryTree } from "@/lib/data/categories";
import { ANNOUNCEMENT_MESSAGE, MAIN_NAV_LINKS, SITE_NAME } from "@/lib/constants";

export async function SiteHeader() {
  const categoryTree = await getCategoryTree();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="bg-primary py-2 text-center text-xs font-medium text-primary-foreground">
        {ANNOUNCEMENT_MESSAGE}
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <MobileNav categoryTree={categoryTree} />

        <Link href="/" className="font-heading text-2xl tracking-tight shrink-0">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {MAIN_NAV_LINKS.map((link) =>
            link.label === "Shop" ? (
              <DropdownMenu key={link.href}>
                <DropdownMenuTrigger className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                  Shop
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem render={<Link href="/products">All Products</Link>} />
                  {categoryTree.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      render={<Link href={`/categories/${category.slug}`}>{category.name}</Link>}
                    />
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="ml-auto hidden max-w-sm flex-1 sm:block">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <CartButton />
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 sm:hidden">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}
