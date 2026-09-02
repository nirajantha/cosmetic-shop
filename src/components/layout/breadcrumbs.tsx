import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/">{SITE_NAME}</Link>} />
        </BreadcrumbItem>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={item.label} className="flex items-center gap-1.5 sm:gap-2.5">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.href}>{item.label}</Link>} />
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** JSON-LD BreadcrumbList structured data, matching the visible breadcrumb trail. */
export function breadcrumbJsonLd(items: BreadcrumbEntry[], siteUrl: string) {
  const allItems = [{ label: "Home", href: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? new URL(item.href, siteUrl).toString() : undefined,
    })),
  };
}
