import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory, toggleCategoryActive } from "@/lib/actions/categories";
import { getAllCategoriesForAdmin } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Categories</h1>
        <Link href="/admin/categories/new" className={buttonVariants()}>New Category</Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.parent?.name ?? "—"}</TableCell>
                <TableCell>{category._count.products}</TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? "secondary" : "outline"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Edit
                  </Link>
                  <ConfirmActionButton
                    label={category.isActive ? "Deactivate" : "Activate"}
                    variant="outline"
                    title={category.isActive ? "Deactivate category?" : "Activate category?"}
                    description="This changes whether the category is visible on the storefront."
                    action={toggleCategoryActive.bind(null, category.id, !category.isActive)}
                  />
                  <ConfirmActionButton
                    label="Delete"
                    title="Delete category?"
                    description="If products or subcategories still reference it, it will be archived instead of deleted."
                    action={deleteCategory.bind(null, category.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
