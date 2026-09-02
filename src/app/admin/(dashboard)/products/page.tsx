import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { ProductSearchBar } from "@/components/admin/product-search-bar";
import { ProductPagination } from "@/components/product/product-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteProduct } from "@/lib/actions/products";
import { getProductsForAdmin } from "@/lib/data/admin-products";
import { formatCurrency } from "@/lib/utils";
import type { ProductStatus } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Products" };

const STATUS_VARIANT: Record<ProductStatus, "secondary" | "outline" | "destructive"> = {
  ACTIVE: "secondary",
  DRAFT: "outline",
  OUT_OF_STOCK: "destructive",
  ARCHIVED: "outline",
};

interface AdminProductsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const query = await searchParams;
  const page = query.page ? Number(query.page) : 1;

  const { products, total, totalPages } = await getProductsForAdmin({
    search: query.search,
    status: query.status as ProductStatus | undefined,
    page,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Products</h1>
        <Button render={<Link href="/admin/products/new">New Product</Link>} />
      </div>

      <Suspense fallback={null}>
        <ProductSearchBar />
      </Suspense>

      <p className="text-sm text-muted-foreground">{total} product{total === 1 ? "" : "s"}</p>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="flex items-center gap-2 font-medium">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.images[0] && (
                      <Image src={product.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                  <span className="line-clamp-1">{product.name}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="text-muted-foreground">{product.brand.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[product.status]}>{product.status}</Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" render={<Link href={`/admin/products/${product.id}/edit`}>Edit</Link>} />
                  <ConfirmActionButton
                    label="Delete"
                    title="Delete product?"
                    description="If this product has order history, it will be archived instead of deleted."
                    action={deleteProduct.bind(null, product.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductPagination page={page} totalPages={totalPages} searchParams={query} basePath="/admin/products" />
    </div>
  );
}
