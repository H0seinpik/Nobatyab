import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  blockFitsUserAvailability,
  filterSlotsByUserAvailability,
  slotFitsUserAvailability,
} from "./availabilityFilter.js";
import { findConsecutiveSlots, type SlotRecord } from "./findConsecutiveSlots.js";

const SATURDAY = 6;
const getDayOfWeek = () => SATURDAY;

function slot(
  startTime: string,
  endTime: string,
  overrides: Partial<SlotRecord> = {},
): SlotRecord {
  return {
    id: `slot-${startTime}`,
    providerId: "provider-1",
    date: "2026-06-14",
    startTime,
    endTime,
    isBooked: false,
    ...overrides,
  };
}

describe("slotFitsUserAvailability", () => {
  const userWindows = [{ dayOfWeek: SATURDAY, startTime: "10:00", endTime: "12:00" }];

  it("accepts a provider slot fully inside user availability", () => {
    assert.equal(
      slotFitsUserAvailability(slot("10:00", "10:30"), userWindows, getDayOfWeek),
      true,
    );
  });

  it("rejects a provider slot that only partially overlaps user availability", () => {
    assert.equal(
      slotFitsUserAvailability(slot("09:30", "10:00"), userWindows, getDayOfWeek),
      false,
    );
    assert.equal(
      slotFitsUserAvailability(slot("11:30", "12:30"), userWindows, getDayOfWeek),
      false,
    );
  });

  it("rejects slots with no overlap", () => {
    assert.equal(
      slotFitsUserAvailability(slot("08:00", "08:30"), userWindows, getDayOfWeek),
      false,
    );
  });

  it("rejects edge-touching slots (11:00-12:00 user vs 10:30-11:00 provider)", () => {
    const edgeUser = [{ dayOfWeek: SATURDAY, startTime: "11:00", endTime: "12:00" }];
    assert.equal(
      slotFitsUserAvailability(slot("10:30", "11:00"), edgeUser, getDayOfWeek),
      false,
    );
  });
});

describe("blockFitsUserAvailability", () => {
  const userWindows = [{ dayOfWeek: SATURDAY, startTime: "10:00", endTime: "11:00" }];

  it("accepts a block that exactly matches the intersection", () => {
    assert.equal(
      blockFitsUserAvailability(
        { date: "2026-06-14", startTime: "10:00", endTime: "11:00" },
        userWindows,
        getDayOfWeek,
      ),
      true,
    );
  });

  it("rejects a block extending beyond user availability", () => {
    assert.equal(
      blockFitsUserAvailability(
        { date: "2026-06-14", startTime: "10:00", endTime: "11:30" },
        userWindows,
        getDayOfWeek,
      ),
      false,
    );
  });

  it("rejects a block starting before user availability", () => {
    assert.equal(
      blockFitsUserAvailability(
        { date: "2026-06-14", startTime: "09:30", endTime: "10:30" },
        userWindows,
        getDayOfWeek,
      ),
      false,
    );
  });
});

describe("findConsecutiveSlots with user filter", () => {
  const userWindows = [{ dayOfWeek: SATURDAY, startTime: "10:00", endTime: "11:00" }];

  const providerDaySlots = [
    slot("09:00", "09:30"),
    slot("09:30", "10:00"),
    slot("10:00", "10:30"),
    slot("10:30", "11:00"),
    slot("11:00", "11:30"),
  ];

  it("only suggests blocks fully inside user/provider intersection", () => {
    const filtered = filterSlotsByUserAvailability(providerDaySlots, userWindows, getDayOfWeek);
    const blocks = findConsecutiveSlots(filtered, 60);

    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].startTime, "10:00");
    assert.equal(blocks[0].endTime, "11:00");
    assert.equal(
      blockFitsUserAvailability(blocks[0], userWindows, getDayOfWeek),
      true,
    );
  });

  it("returns no blocks when user window is too short for service duration", () => {
    const shortUser = [{ dayOfWeek: SATURDAY, startTime: "10:00", endTime: "10:45" }];
    const filtered = filterSlotsByUserAvailability(providerDaySlots, shortUser, getDayOfWeek);
    const blocks = findConsecutiveSlots(filtered, 60);

    assert.equal(blocks.length, 0);
  });

  it("does not return a block from partial-overlap provider slots", () => {
    const partialUser = [{ dayOfWeek: SATURDAY, startTime: "10:15", endTime: "11:15" }];
    const filtered = filterSlotsByUserAvailability(providerDaySlots, partialUser, getDayOfWeek);

    assert.deepEqual(
      filtered.map((s) => s.startTime),
      ["10:30"],
    );

    const blocks = findConsecutiveSlots(filtered, 30);
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].startTime, "10:30");
    assert.equal(blocks[0].endTime, "11:00");
  });
});
