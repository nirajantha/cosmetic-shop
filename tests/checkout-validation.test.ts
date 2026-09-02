import assert from "node:assert/strict";
import { test } from "node:test";
import { checkoutCustomerSchema, checkoutRequestSchema } from "../src/lib/validations/checkout";

const validCustomer = {
  customerName: "Jane Doe",
  phone: "9812345678",
  email: "jane@example.com",
  province: "Bagmati",
  city: "Kathmandu",
  address: "123 Main Street",
  notes: "",
};

test("checkoutCustomerSchema: accepts a fully valid customer", () => {
  const result = checkoutCustomerSchema.safeParse(validCustomer);
  assert.equal(result.success, true);
});

test("checkoutCustomerSchema: email is optional", () => {
  const result = checkoutCustomerSchema.safeParse({ ...validCustomer, email: "" });
  assert.equal(result.success, true);
});

test("checkoutCustomerSchema: rejects an invalid email", () => {
  const result = checkoutCustomerSchema.safeParse({ ...validCustomer, email: "not-an-email" });
  assert.equal(result.success, false);
});

test("checkoutCustomerSchema: rejects a name that's too short", () => {
  const result = checkoutCustomerSchema.safeParse({ ...validCustomer, customerName: "J" });
  assert.equal(result.success, false);
});

test("checkoutCustomerSchema: rejects a phone number with letters", () => {
  const result = checkoutCustomerSchema.safeParse({ ...validCustomer, phone: "call-me-maybe" });
  assert.equal(result.success, false);
});

test("checkoutCustomerSchema: rejects a missing address", () => {
  const result = checkoutCustomerSchema.safeParse({ ...validCustomer, address: "" });
  assert.equal(result.success, false);
});

test("checkoutRequestSchema: rejects an empty cart", () => {
  const result = checkoutRequestSchema.safeParse({ customer: validCustomer, items: [] });
  assert.equal(result.success, false);
});

test("checkoutRequestSchema: rejects a quantity of 0 or below", () => {
  const result = checkoutRequestSchema.safeParse({
    customer: validCustomer,
    items: [{ productId: "p1", quantity: 0 }],
  });
  assert.equal(result.success, false);
});

test("checkoutRequestSchema: rejects a quantity above the 50-unit cap", () => {
  const result = checkoutRequestSchema.safeParse({
    customer: validCustomer,
    items: [{ productId: "p1", quantity: 51 }],
  });
  assert.equal(result.success, false);
});

test("checkoutRequestSchema: accepts a valid cart", () => {
  const result = checkoutRequestSchema.safeParse({
    customer: validCustomer,
    items: [{ productId: "p1", quantity: 2 }],
  });
  assert.equal(result.success, true);
});
