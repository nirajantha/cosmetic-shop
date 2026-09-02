import assert from "node:assert/strict";
import { test } from "node:test";
import { selectDiscount, selectItemCount, selectSubtotal, selectTotal } from "../src/store/cart-store";
import type { CartItem } from "../src/store/cart-store";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    slug: "product-1",
    name: "Product 1",
    brandName: "Brand",
    image: null,
    price: 100,
    originalPrice: 100,
    quantity: 1,
    maxStock: 10,
    ...overrides,
  };
}

test("selectItemCount sums quantities across items", () => {
  const state = { items: [item({ quantity: 2 }), item({ productId: "p2", quantity: 3 })] };
  assert.equal(selectItemCount(state), 5);
});

test("selectItemCount is 0 for an empty cart", () => {
  assert.equal(selectItemCount({ items: [] }), 0);
});

test("selectSubtotal uses the original (pre-discount) price", () => {
  const state = { items: [item({ originalPrice: 500, price: 400, quantity: 2 })] };
  assert.equal(selectSubtotal(state), 1000);
});

test("selectDiscount is the gap between original and discounted price, times quantity", () => {
  const state = { items: [item({ originalPrice: 500, price: 400, quantity: 2 })] };
  assert.equal(selectDiscount(state), 200);
});

test("selectDiscount is 0 when nothing is discounted", () => {
  const state = { items: [item({ originalPrice: 500, price: 500, quantity: 3 })] };
  assert.equal(selectDiscount(state), 0);
});

test("selectTotal uses the discounted price", () => {
  const state = {
    items: [item({ originalPrice: 500, price: 400, quantity: 2 }), item({ productId: "p2", price: 100, originalPrice: 100, quantity: 1 })],
  };
  assert.equal(selectTotal(state), 900);
});

test("subtotal, discount and total stay consistent: total = subtotal - discount", () => {
  const state = {
    items: [
      item({ productId: "p1", originalPrice: 1000, price: 800, quantity: 2 }),
      item({ productId: "p2", originalPrice: 500, price: 500, quantity: 1 }),
    ],
  };
  const subtotal = selectSubtotal(state);
  const discount = selectDiscount(state);
  const total = selectTotal(state);
  assert.equal(total, subtotal - discount);
});
