import { db } from "@/lib/db";
import type { PricingOffer } from "@/lib/pricing";
import { getOfferStatus } from "@/lib/pricing";

/** Offers that are currently live, shaped for the pricing engine. */
export async function getLiveOffersForPricing(): Promise<PricingOffer[]> {
  const now = new Date();
  const offers = await db.offer.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    include: { products: { select: { id: true } } },
  });

  return offers.map((offer) => ({
    ...offer,
    productIds: offer.products.map((p) => p.id),
  }));
}

export async function getActiveOffersForDisplay() {
  const now = new Date();
  return db.offer.findMany({
    where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      products: { select: { id: true, slug: true } },
    },
    orderBy: { endDate: "asc" },
  });
}

export async function getAllOffersForAdmin() {
  const offers = await db.offer.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      products: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return offers.map((offer) => ({ ...offer, status: getOfferStatus(offer) }));
}

export async function getOfferById(id: string) {
  return db.offer.findUnique({
    where: { id },
    include: { products: { select: { id: true, name: true, slug: true } } },
  });
}
