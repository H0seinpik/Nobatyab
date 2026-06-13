import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeOverlap,
  isRangeContainedIn,
  rangesOverlap,
} from "./overlap.js";

describe("rangesOverlap", () => {
  it("detects partial overlap", () => {
    assert.equal(rangesOverlap(600, 720, 660, 780), true); // 10-12 ∩ 11-13
  });

  it("detects full overlap (inner range inside outer)", () => {
    assert.equal(rangesOverlap(540, 780, 600, 720), true); // 9-13 ⊃ 10-12
  });

  it("rejects no overlap", () => {
    assert.equal(rangesOverlap(600, 720, 780, 840), false); // 10-12 vs 13-14
  });

  it("rejects edge-only touch (10:00-11:00 and 11:00-12:00)", () => {
    assert.equal(rangesOverlap(600, 660, 660, 720), false);
  });
});

describe("computeOverlap", () => {
  it("returns partial overlap window", () => {
    assert.deepEqual(computeOverlap(600, 720, 660, 780), { start: 660, end: 720 });
  });

  it("returns full overlap window when provider is inside user range", () => {
    assert.deepEqual(computeOverlap(540, 780, 600, 720), { start: 600, end: 720 });
  });

  it("returns null when ranges do not overlap", () => {
    assert.equal(computeOverlap(600, 720, 780, 840), null);
  });

  it("returns null for edge touch", () => {
    assert.equal(computeOverlap(600, 660, 660, 720), null);
  });

  it("returns null for zero-length input ranges", () => {
    assert.equal(computeOverlap(600, 600, 540, 780), null);
  });
});

describe("isRangeContainedIn", () => {
  it("accepts a range fully inside the outer bounds", () => {
    assert.equal(isRangeContainedIn(600, 720, 540, 780), true);
  });

  it("rejects a range that exceeds the outer end", () => {
    assert.equal(isRangeContainedIn(600, 780, 600, 720), false);
  });

  it("rejects a range that starts before the outer start", () => {
    assert.equal(isRangeContainedIn(540, 660, 600, 720), false);
  });

  it("rejects zero-length ranges", () => {
    assert.equal(isRangeContainedIn(600, 600, 540, 780), false);
  });
});
