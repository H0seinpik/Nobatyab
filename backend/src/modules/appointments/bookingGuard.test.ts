import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAppointmentRequestKey,
  buildSmartBookingRequestKey,
} from "../../modules/appointments/bookingGuard.js";

describe("buildSmartBookingRequestKey", () => {
  it("returns the same key regardless of timeSlotIds order", () => {
    const input = {
      providerId: "p1",
      providerServiceId: "ps1",
      timeSlotIds: ["slot-b", "slot-a"],
    };
    assert.equal(
      buildSmartBookingRequestKey("user-1", input),
      buildSmartBookingRequestKey("user-1", {
        ...input,
        timeSlotIds: ["slot-a", "slot-b"],
      }),
    );
  });

  it("returns different keys for different users", () => {
    const input = {
      providerId: "p1",
      providerServiceId: "ps1",
      timeSlotIds: ["slot-a"],
    };
    assert.notEqual(
      buildSmartBookingRequestKey("user-1", input),
      buildSmartBookingRequestKey("user-2", input),
    );
  });
});

describe("buildAppointmentRequestKey", () => {
  it("returns stable keys for the same start time", () => {
    const startAt = new Date("2026-06-14T10:00:00.000Z");
    const key = buildAppointmentRequestKey("user-1", {
      providerId: "p1",
      providerServiceId: "ps1",
      startAt,
    });
    assert.equal(
      key,
      buildAppointmentRequestKey("user-1", {
        providerId: "p1",
        providerServiceId: "ps1",
        startAt: new Date("2026-06-14T10:00:00.000Z"),
      }),
    );
  });
});
