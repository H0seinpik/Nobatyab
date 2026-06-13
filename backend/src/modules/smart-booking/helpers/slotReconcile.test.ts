import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { partitionSlotsForReconcile, reconcileOrphanSlot } from "./slotReconcile.js";

describe("reconcileOrphanSlot", () => {
  const expected = new Set(["16:00", "16:30", "17:00", "17:30"]);

  it("keeps slots inside the new schedule", () => {
    assert.deepEqual(reconcileOrphanSlot("16:00", expected, { isBooked: false, appointmentId: null }), {
      type: "keep",
    });
  });

  it("deletes unbooked slots outside the new schedule", () => {
    assert.deepEqual(reconcileOrphanSlot("10:00", expected, { isBooked: false, appointmentId: null }), {
      type: "delete",
    });
  });

  it("deactivates booked slots outside the new schedule", () => {
    assert.deepEqual(
      reconcileOrphanSlot("10:00", expected, { isBooked: true, appointmentId: "appt-1" }),
      { type: "deactivate" },
    );
  });
});

describe("partitionSlotsForReconcile", () => {
  it("partitions 10-14 slots when schedule changes to 16-18", () => {
    const expected = new Set(["16:00", "16:30", "17:00", "17:30"]);
    const slots = [
      { id: "1", startTime: "10:00", isBooked: false, appointmentId: null },
      { id: "2", startTime: "10:30", isBooked: true, appointmentId: "a1" },
      { id: "3", startTime: "16:00", isBooked: false, appointmentId: null },
    ];

    const result = partitionSlotsForReconcile(slots, expected);
    assert.deepEqual(result.toDelete, ["1"]);
    assert.deepEqual(result.toDeactivate, ["2"]);
  });
});
