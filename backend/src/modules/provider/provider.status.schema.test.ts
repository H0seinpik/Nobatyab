import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { updateProviderStatusSchema } from "./provider.schema.js";

describe("updateProviderStatusSchema", () => {
  it("accepts isActive true/false", () => {
    assert.deepEqual(updateProviderStatusSchema.parse({ isActive: true }), { isActive: true });
    assert.deepEqual(updateProviderStatusSchema.parse({ isActive: false }), { isActive: false });
  });

  it("rejects missing isActive", () => {
    assert.throws(() => updateProviderStatusSchema.parse({}));
  });
});
