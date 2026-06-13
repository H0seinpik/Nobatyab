import { timeToMinutes } from "../../../shared/utils/datetime.js";
import type { SlotRecord } from "./findConsecutiveSlots.js";
import { computeOverlap, isRangeContainedIn, rangesOverlap } from "./overlap.js";

export type AvailabilityWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

/** Returns day of week (0=Sun) for a YYYY-MM-DD date string in app timezone. */
export function getDayOfWeekForDate(
  dateStr: string,
  getLocalDayOfWeek: (date: Date) => number,
  localToUtc: (date: string, time: string) => Date,
): number {
  return getLocalDayOfWeek(localToUtc(dateStr, "12:00"));
}

/**
 * Keep provider slots that lie fully inside the intersection of user and provider ranges.
 * A 30-minute provider slot is kept only when the entire slot fits in a user window.
 */
export function filterSlotsByUserAvailability(
  slots: SlotRecord[],
  availabilities: AvailabilityWindow[],
  getDayOfWeek: (dateStr: string) => number,
): SlotRecord[] {
  if (availabilities.length === 0) return [];

  return slots.filter((slot) => slotFitsUserAvailability(slot, availabilities, getDayOfWeek));
}

export function slotFitsUserAvailability(
  slot: Pick<SlotRecord, "date" | "startTime" | "endTime">,
  availabilities: AvailabilityWindow[],
  getDayOfWeek: (dateStr: string) => number,
): boolean {
  const dayOfWeek = getDayOfWeek(slot.date);
  const slotStart = timeToMinutes(slot.startTime);
  const slotEnd = timeToMinutes(slot.endTime);

  if (slotStart >= slotEnd) return false;

  return availabilities.some((window) => {
    if (window.dayOfWeek !== dayOfWeek) return false;

    const userStart = timeToMinutes(window.startTime);
    const userEnd = timeToMinutes(window.endTime);

    if (!rangesOverlap(userStart, userEnd, slotStart, slotEnd)) return false;

    const overlap = computeOverlap(userStart, userEnd, slotStart, slotEnd);
    if (!overlap) return false;

    return isRangeContainedIn(slotStart, slotEnd, overlap.start, overlap.end);
  });
}

/**
 * A booking block is valid only when it equals the user/provider intersection window
 * (i.e. the full block fits inside at least one user availability window).
 */
export function blockFitsUserAvailability(
  block: { date: string; startTime: string; endTime: string },
  availabilities: AvailabilityWindow[],
  getDayOfWeek: (dateStr: string) => number,
): boolean {
  const dayOfWeek = getDayOfWeek(block.date);
  const blockStart = timeToMinutes(block.startTime);
  const blockEnd = timeToMinutes(block.endTime);

  if (blockStart >= blockEnd) return false;

  return availabilities.some((window) => {
    if (window.dayOfWeek !== dayOfWeek) return false;

    const userStart = timeToMinutes(window.startTime);
    const userEnd = timeToMinutes(window.endTime);

    if (!rangesOverlap(userStart, userEnd, blockStart, blockEnd)) return false;

    const overlap = computeOverlap(userStart, userEnd, blockStart, blockEnd);
    if (!overlap) return false;

    return isRangeContainedIn(blockStart, blockEnd, overlap.start, overlap.end);
  });
}
