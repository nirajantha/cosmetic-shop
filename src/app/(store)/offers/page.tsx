import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { OfferCard, offerTargetHref } from "@/components/store/offer-card";
import { ProductRail } from "@/components/store/product-rail";
import { getActiveOffersForDisplay, getLiveOffersForPricing } from "@/lib/data/offers";
import { getProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Offers & Deals",
  description: "Explore every active discount and promotion at Aurelle — updated in real time.",
};

export default async function OffersPage() {
  const [offers, activeOffers] = await Promise.all([getActiveOffersForDisplay(), getLiveOffersForPricing()]);

  const offerProducts = await Promise.all(
    offers.map((offer) =>
      getProducts({
        productIds: offer.products.length > 0 ? offer.products.map((p) => p.id) : undefined,
        brand: !offer.products.length ? (offer.brand?.slug ?? undefined) : undefined,
        category: !offer.products.length && !offer.brand ? (offer.category?.slug ?? undefined) : undefined,
        pageSize: 4,
      })
    )
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Offers" }]} />
      <h1 className="mt-4 font-heading text-3xl">Offers & Deals</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {offers.length} active offer{offers.length === 1 ? "" : "s"}
      </p>

      {offers.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No active offers right now — check back soon.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}

      {offers.map((offer, index) => (
        <ProductRail
          key={offer.id}
          title={offer.title}
          viewAllHref={offerTargetHref(offer)}
          products={offerProducts[index]?.products ?? []}
          offers={activeOffers}
        />
      ))}
    </div>
  );
}
