import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getActiveBrands } from "@/lib/data/brands";
import { getAllActiveCategories } from "@/lib/data/categories";
import { getProductByIdForAdmin } from "@/lib/data/admin-products";

export const metadata: Metadata = { title: "Edit Product" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    getProductByIdForAdmin(id),
    getActiveBrands(),
    getAllActiveCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl">Edit Product</h1>
      <ProductForm
        mode="edit"
        productId={product.id}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          name: product.name,
          sku: product.sku,
          brandId: product.brandId,
          categoryId: product.categoryId,
          description: product.description,
          shortDescription: product.shortDescription ?? "",
          ingredients: product.ingredients ?? "",
          howToUse: product.howToUse ?? "",
          price: Number(product.price),
          salePrice: product.salePrice ? Number(product.salePrice) : undefined,
          stock: product.stock,
          status: product.status,
          featured: product.featured,
          isNew: product.isNew,
          isBestSeller: product.isBestSeller,
          images: product.images.map((img) => ({ url: img.url, alt: img.alt })),
        }}
      />
    </div>
  );
}
