import Link from "next/link";
import { OfferCard, type OfferCardData } from "@/components/store/offer-card";

export function SpecialOffers({ offers }: { offers: OfferCardData[] }) {
  if (offers.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-heading text-2xl">Special Offers</h2>
        <Link href="/offers" className="text-sm font-medium underline-offset-4 hover:underline">
          View all
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.slice(0, 3).map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
