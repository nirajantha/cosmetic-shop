import Link from "next/link";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { getActiveBrands } from "@/lib/data/brands";
import { getCategoryTree } from "@/lib/data/categories";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export async function SiteFooter() {
  const [categoryTree, brands] = await Promise.all([getCategoryTree(), getActiveBrands()]);

  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-border pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-xl">Join the Aurelle list</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New arrivals, exclusive offers and beauty tips — straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-8 pt-10 sm:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg">{SITE_NAME}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{SITE_TAGLINE}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Shop by Category</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {categoryTree.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Top Brands</h4>
            <ul className="mt-3 flex flex-col gap-2">
              {brands.slice(0, 5).map((brand) => (
                <li key={brand.id}>
                  <Link href={`/brands/${brand.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-sm text-muted-foreground hover:text-foreground">
                  Offers
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
