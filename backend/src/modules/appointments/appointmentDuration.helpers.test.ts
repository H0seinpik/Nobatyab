import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appointmentFitsWorkingHours,
  appointmentFitsWorkingHoursAt,
} from "./appointmentDuration.helpers.js";
import { localToUtc } from "../../shared/utils/datetime.js";

const workingHours = [{ startTime: "10:00", endTime: "12:00" }];

describe("appointmentFitsWorkingHours", () => {
  it("rejects 11:30 with 60-minute duration in 10:00-12:00 window", () => {
    assert.equal(appointmentFitsWorkingHours(workingHours, "11:30", 60), false);
  });

  it("accepts 11:00 with 60-minute duration in 10:00-12:00 window", () => {
    assert.equal(appointmentFitsWorkingHours(workingHours, "11:00", 60), true);
  });

  it("accepts 10:00 and 10:30 with 60-minute duration", () => {
    assert.equal(appointmentFitsWorkingHours(workingHours, "10:00", 60), true);
    assert.equal(appointmentFitsWorkingHours(workingHours, "10:30", 60), true);
  });

  it("rejects appointments with no matching working-hour range", () => {
    assert.equal(appointmentFitsWorkingHours(workingHours, "09:00", 60), false);
    assert.equal(appointmentFitsWorkingHours([], "11:00", 60), false);
  });

  it("accepts appointments that fit within one of multiple ranges", () => {
    const splitHours = [
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "11:00", endTime: "12:00" },
    ];
    assert.equal(appointmentFitsWorkingHours(splitHours, "11:00", 60), true);
    assert.equal(appointmentFitsWorkingHours(splitHours, "10:30", 60), false);
  });
});

describe("appointmentFitsWorkingHoursAt", () => {
  it("validates using local time from a UTC Date", () => {
    const startAt = localToUtc("2026-06-14", "11:00");
    assert.equal(appointmentFitsWorkingHoursAt(workingHours, startAt, 60), true);

    const invalidStartAt = localToUtc("2026-06-14", "11:30");
    assert.equal(appointmentFitsWorkingHoursAt(workingHours, invalidStartAt, 60), false);
  });
});
