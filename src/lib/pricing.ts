/** Anything that can be coerced with Number(): a plain number, a numeric string, or Prisma's Decimal. */
type Numeric = number | string | { toString(): string };

export interface PricingOffer {
  id: string;
  title: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: Numeric;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  categoryId: string | null;
  brandId: string | null;
  productIds?: string[];
}

export interface PricingProduct {
  id: string;
  price: Numeric;
  salePrice: Numeric | null;
  brandId: string;
  categoryId: string;
}

export type OfferStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED";

export function getOfferStatus(
  offer: { isActive: boolean; startDate: Date; endDate: Date },
  now = new Date()
): OfferStatus {
  if (!offer.isActive) return "EXPIRED";
  if (now < offer.startDate) return "SCHEDULED";
  if (now > offer.endDate) return "EXPIRED";
  return "ACTIVE";
}

export function isOfferLive(offer: { isActive: boolean; startDate: Date; endDate: Date }, now = new Date()): boolean {
  return getOfferStatus(offer, now) === "ACTIVE";
}

function offerAppliesToProduct(offer: PricingOffer, product: Pick<PricingProduct, "id" | "brandId" | "categoryId">): boolean {
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

export const FREE_DELIVERY_THRESHOLD = 3000;
export const STANDARD_DELIVERY_CHARGE = 100;

/** Flat delivery fee, waived above the free-delivery threshold advertised sitewide. */
export function calculateDeliveryCharge(amountAfterDiscount: number): number {
  return amountAfterDiscount >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE;
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
  product: PricingProduct,
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
