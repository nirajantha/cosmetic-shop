import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteBrand, toggleBrandActive } from "@/lib/actions/brands";
import { getAllBrandsForAdmin } from "@/lib/data/brands";

export const metadata: Metadata = { title: "Brands" };

export default async function AdminBrandsPage() {
  const brands = await getAllBrandsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Brands</h1>
        <Button render={<Link href="/admin/brands/new">New Brand</Link>} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>{brand._count.products}</TableCell>
                <TableCell>
                  <Badge variant={brand.isActive ? "secondary" : "outline"}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" render={<Link href={`/admin/brands/${brand.id}/edit`}>Edit</Link>} />
                  <ConfirmActionButton
                    label={brand.isActive ? "Deactivate" : "Activate"}
                    variant="outline"
                    title={brand.isActive ? "Deactivate brand?" : "Activate brand?"}
                    description="This changes whether the brand and its products are visible on the storefront."
                    action={toggleBrandActive.bind(null, brand.id, !brand.isActive)}
                  />
                  <ConfirmActionButton
                    label="Delete"
                    title="Delete brand?"
                    description="If products still reference it, it will be archived instead of deleted."
                    action={deleteBrand.bind(null, brand.id)}
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
