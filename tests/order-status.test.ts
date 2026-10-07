import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canTransitionOrder } from "../src/lib/order-status";

describe("canTransitionOrder", () => {
  it("allows the take -> complete workflow", () => {
    assert.equal(canTransitionOrder("PENDING", "IN_PROGRESS"), true);
    assert.equal(canTransitionOrder("IN_PROGRESS", "COMPLETED"), true);
  });

  it("allows cancelling before completion", () => {
    assert.equal(canTransitionOrder("PENDING", "CANCELLED"), true);
    assert.equal(canTransitionOrder("IN_PROGRESS", "CANCELLED"), true);
  });

  it("blocks skipping steps and changing finished orders", () => {
    assert.equal(canTransitionOrder("PENDING", "COMPLETED"), false);
    assert.equal(canTransitionOrder("COMPLETED", "CANCELLED"), false);
    assert.equal(canTransitionOrder("COMPLETED", "IN_PROGRESS"), false);
    assert.equal(canTransitionOrder("CANCELLED", "PENDING"), false);
  });
});
