import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteOffer, toggleOfferActive } from "@/lib/actions/offers";
import { getAllOffersForAdmin } from "@/lib/data/offers";
import { offerValueLabel } from "@/components/store/offer-card";

export const metadata: Metadata = { title: "Offers" };

const STATUS_VARIANT = {
  ACTIVE: "secondary",
  SCHEDULED: "outline",
  EXPIRED: "outline",
} as const;

export default async function AdminOffersPage() {
  const offers = await getAllOffersForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Offers</h1>
        <Button render={<Link href="/admin/offers/new">New Offer</Link>} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="font-medium">{offer.title}</TableCell>
                <TableCell>{offerValueLabel(offer)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {offer.brand?.name ?? offer.category?.name ?? `${offer.products.length} products`}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {offer.startDate.toLocaleDateString()} – {offer.endDate.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[offer.status]}>{offer.status}</Badge>
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" render={<Link href={`/admin/offers/${offer.id}/edit`}>Edit</Link>} />
                  <ConfirmActionButton
                    label={offer.isActive ? "Deactivate" : "Activate"}
                    variant="outline"
                    title={offer.isActive ? "Deactivate offer?" : "Activate offer?"}
                    description="This changes whether the offer can currently apply on the storefront."
                    action={toggleOfferActive.bind(null, offer.id, !offer.isActive)}
                  />
                  <ConfirmActionButton
                    label="Delete"
                    title="Delete offer?"
                    description="This permanently removes the offer. This cannot be undone."
                    action={deleteOffer.bind(null, offer.id)}
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
