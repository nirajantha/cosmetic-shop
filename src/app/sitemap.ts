import type { MetadataRoute } from "next";
import { db, withRetry } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [products, categories, brands] = await withRetry(() =>
    Promise.all([
      db.product.findMany({
        where: { status: { in: ["ACTIVE", "OUT_OF_STOCK"] } },
        select: { slug: true, updatedAt: true },
      }),
      db.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      db.brand.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    ])
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/offers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${siteUrl}/brands/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
}
