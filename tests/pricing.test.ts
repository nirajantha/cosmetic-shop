import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateDeliveryCharge,
  calculateEffectivePrice,
  getOfferStatus,
  type PricingOffer,
} from "../src/lib/pricing";

const baseProduct = { id: "p1", price: 1000, salePrice: null, brandId: "b1", categoryId: "c1" };

function offer(overrides: Partial<PricingOffer> = {}): PricingOffer {
  return {
    id: "o1",
    title: "Test Offer",
    type: "PERCENTAGE",
    value: 10,
    startDate: new Date(Date.now() - 1000),
    endDate: new Date(Date.now() + 1000 * 60 * 60),
    isActive: true,
    categoryId: null,
    brandId: null,
    ...overrides,
  };
}

test("calculateEffectivePrice: no offers, no sale price -> full price", () => {
  const result = calculateEffectivePrice(baseProduct, []);
  assert.equal(result.effectivePrice, 1000);
  assert.equal(result.isOnSale, false);
  assert.equal(result.discountPercent, 0);
});

test("calculateEffectivePrice: sale price only", () => {
  const result = calculateEffectivePrice({ ...baseProduct, salePrice: 800 }, []);
  assert.equal(result.effectivePrice, 800);
  assert.equal(result.discountAmount, 200);
  assert.equal(result.isOnSale, true);
});

test("calculateEffectivePrice: percentage offer applies to matching brand", () => {
  const result = calculateEffectivePrice(baseProduct, [offer({ brandId: "b1", value: 20 })]);
  assert.equal(result.effectivePrice, 800);
  assert.equal(result.discountPercent, 20);
  assert.equal(result.appliedOfferId, "o1");
});

test("calculateEffectivePrice: fixed amount offer applies to matching category", () => {
  const result = calculateEffectivePrice(baseProduct, [
    offer({ id: "o2", type: "FIXED_AMOUNT", value: 150, categoryId: "c1" }),
  ]);
  assert.equal(result.effectivePrice, 850);
});

test("calculateEffectivePrice: offer only applies when brand/category/product matches", () => {
  const result = calculateEffectivePrice(baseProduct, [offer({ brandId: "other-brand" })]);
  assert.equal(result.effectivePrice, 1000);
  assert.equal(result.isOnSale, false);
});

test("calculateEffectivePrice: picks the better of sale price and offer, never stacks", () => {
  const withBetterOffer = calculateEffectivePrice({ ...baseProduct, salePrice: 900 }, [
    offer({ brandId: "b1", value: 30 }),
  ]);
  assert.equal(withBetterOffer.effectivePrice, 700); // 30% off 1000, better than the 900 sale price

  const withWorseOffer = calculateEffectivePrice({ ...baseProduct, salePrice: 700 }, [
    offer({ brandId: "b1", value: 10 }),
  ]);
  assert.equal(withWorseOffer.effectivePrice, 700); // sale price beats a 10% ($100) offer
});

test("calculateEffectivePrice: scheduled and expired offers never apply", () => {
  const scheduled = offer({ startDate: new Date(Date.now() + 1000 * 60 * 60), brandId: "b1" });
  const expired = offer({ id: "o3", endDate: new Date(Date.now() - 1000), brandId: "b1" });
  const result = calculateEffectivePrice(baseProduct, [scheduled, expired]);
  assert.equal(result.effectivePrice, 1000);
});

test("calculateEffectivePrice: inactive offer never applies even within date range", () => {
  const result = calculateEffectivePrice(baseProduct, [offer({ brandId: "b1", isActive: false })]);
  assert.equal(result.effectivePrice, 1000);
});

test("calculateEffectivePrice: never goes below zero", () => {
  const result = calculateEffectivePrice(baseProduct, [
    offer({ type: "FIXED_AMOUNT", value: 5000, brandId: "b1" }),
  ]);
  assert.equal(result.effectivePrice, 0);
});

test("getOfferStatus: ACTIVE / SCHEDULED / EXPIRED", () => {
  const now = new Date("2026-06-15T00:00:00Z");
  assert.equal(
    getOfferStatus(
      { isActive: true, startDate: new Date("2026-06-01"), endDate: new Date("2026-06-30") },
      now
    ),
    "ACTIVE"
  );
  assert.equal(
    getOfferStatus(
      { isActive: true, startDate: new Date("2026-07-01"), endDate: new Date("2026-07-30") },
      now
    ),
    "SCHEDULED"
  );
  assert.equal(
    getOfferStatus(
      { isActive: true, startDate: new Date("2026-05-01"), endDate: new Date("2026-05-30") },
      now
    ),
    "EXPIRED"
  );
  assert.equal(
    getOfferStatus(
      { isActive: false, startDate: new Date("2026-06-01"), endDate: new Date("2026-06-30") },
      now
    ),
    "EXPIRED"
  );
});

test("calculateDeliveryCharge: free above threshold, flat fee below", () => {
  assert.equal(calculateDeliveryCharge(2999), 100);
  assert.equal(calculateDeliveryCharge(3000), 0);
  assert.equal(calculateDeliveryCharge(5000), 0);
});
