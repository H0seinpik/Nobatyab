import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getActiveHoursForDay, getActiveWorkingHours } from "./workingHours.helpers.js";

describe("workingHours helpers", () => {
  const hours = [
    { id: "1", dayOfWeek: 0, isActive: true },
    { id: "2", dayOfWeek: 0, isActive: false },
    { id: "3", dayOfWeek: 1, isActive: true },
  ];

  it("filters inactive rows from booking", () => {
    assert.deepEqual(getActiveWorkingHours(hours).map((h) => h.id), ["1", "3"]);
  });

  it("returns only active rows for a given day", () => {
    assert.deepEqual(getActiveHoursForDay(hours, 0).map((h) => h.id), ["1"]);
    assert.deepEqual(getActiveHoursForDay(hours, 1).map((h) => h.id), ["3"]);
    assert.deepEqual(getActiveHoursForDay(hours, 2), []);
  });
});
