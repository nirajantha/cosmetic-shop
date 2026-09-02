import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface OfferCardData {
  id: string;
  title: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: unknown;
  bannerImage: string | null;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  products: { slug: string }[];
}

export function offerTargetHref(offer: OfferCardData): string {
  if (offer.brand) return `/brands/${offer.brand.slug}`;
  if (offer.category) return `/categories/${offer.category.slug}`;
  if (offer.products[0]) return `/products/${offer.products[0].slug}`;
  return "/offers";
}

export function offerValueLabel(offer: Pick<OfferCardData, "type" | "value">): string {
  const value = Number(offer.value);
  return offer.type === "PERCENTAGE" ? `${value}% OFF` : `Rs. ${value} OFF`;
}

export function OfferCard({ offer }: { offer: OfferCardData }) {
  return (
    <Link
      href={offerTargetHref(offer)}
      className="group relative flex aspect-16/9 flex-col justify-end overflow-hidden rounded-2xl bg-muted p-6 text-primary-foreground"
    >
      <Image
        src={offer.bannerImage ?? `https://picsum.photos/seed/offer-${offer.id}/900/500`}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="relative flex flex-col gap-1.5">
        <Badge className="w-fit bg-brand-sale text-brand-sale-foreground">{offerValueLabel(offer)}</Badge>
        <h3 className="font-heading text-xl">{offer.title}</h3>
        {offer.description && <p className="line-clamp-1 text-sm text-white/85">{offer.description}</p>}
      </div>
    </Link>
  );
}
