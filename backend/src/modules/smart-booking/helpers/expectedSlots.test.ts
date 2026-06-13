import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildExpectedStartTimes,
  isOrphanSlot,
} from "./expectedSlots.js";

describe("buildExpectedStartTimes", () => {
  it("builds 30-minute slots inside a working-hour range", () => {
    const expected = buildExpectedStartTimes([{ startTime: "09:00", endTime: "11:00" }]);
    assert.deepEqual([...expected], ["09:00", "09:30", "10:00", "10:30"]);
  });

  it("returns empty set when no working hours exist for the day", () => {
    assert.equal(buildExpectedStartTimes([]).size, 0);
  });
});

describe("isOrphanSlot", () => {
  it("flags slots outside the current schedule", () => {
    const expected = new Set(["10:00", "10:30"]);
    assert.equal(isOrphanSlot("09:30", expected), true);
    assert.equal(isOrphanSlot("10:00", expected), false);
  });
});
