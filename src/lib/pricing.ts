import type { Offer, Product } from "@/generated/prisma/client";

export type PricingOffer = Pick<
  Offer,
  "id" | "title" | "type" | "value" | "startDate" | "endDate" | "isActive" | "categoryId" | "brandId"
> & { productIds?: string[] };

export type OfferStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED";

export function getOfferStatus(offer: Pick<Offer, "isActive" | "startDate" | "endDate">, now = new Date()): OfferStatus {
  if (!offer.isActive) return "EXPIRED";
  if (now < offer.startDate) return "SCHEDULED";
  if (now > offer.endDate) return "EXPIRED";
  return "ACTIVE";
}

export function isOfferLive(offer: Pick<Offer, "isActive" | "startDate" | "endDate">, now = new Date()): boolean {
  return getOfferStatus(offer, now) === "ACTIVE";
}

function offerAppliesToProduct(
  offer: PricingOffer,
  product: Pick<Product, "id" | "brandId" | "categoryId">
): boolean {
  if (offer.productIds?.includes(product.id)) return true;
  if (offer.brandId && offer.brandId === product.brandId) return true;
  if (offer.categoryId && offer.categoryId === product.categoryId) return true;
  return false;
}

function applyOfferToPrice(price: number, offer: PricingOffer): number {
  const value = Number(offer.value);
  if (offer.type === "PERCENTAGE") {
    return price * (1 - value / 100);
  }
  return price - value;
}

export interface EffectivePrice {
  originalPrice: number;
  effectivePrice: number;
  discountAmount: number;
  discountPercent: number;
  appliedOfferId: string | null;
  isOnSale: boolean;
}

/**
 * The single source of truth for "what does this product actually cost right now".
 * Considers both a manually-set salePrice and any live offer, and picks whichever
 * gives the customer the better price — offers are never stacked with each other
 * or with the sale price.
 */
export function calculateEffectivePrice(
  product: Pick<Product, "id" | "price" | "salePrice" | "brandId" | "categoryId">,
  activeOffers: PricingOffer[],
  now = new Date()
): EffectivePrice {
  const originalPrice = Number(product.price);
  let bestPrice = originalPrice;
  let appliedOfferId: string | null = null;

  if (product.salePrice != null) {
    bestPrice = Number(product.salePrice);
  }

  for (const offer of activeOffers) {
    if (!isOfferLive(offer, now)) continue;
    if (!offerAppliesToProduct(offer, product)) continue;

    const candidate = applyOfferToPrice(originalPrice, offer);
    if (candidate < bestPrice) {
      bestPrice = candidate;
      appliedOfferId = offer.id;
    }
  }

  const effectivePrice = Math.max(0, Math.round(bestPrice * 100) / 100);
  const discountAmount = Math.round((originalPrice - effectivePrice) * 100) / 100;
  const discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  return {
    originalPrice,
    effectivePrice,
    discountAmount,
    discountPercent,
    appliedOfferId,
    isOnSale: discountAmount > 0,
  };
}
