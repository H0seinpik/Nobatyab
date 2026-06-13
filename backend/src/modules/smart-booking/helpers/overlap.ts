import { timeToMinutes } from "../../../shared/utils/datetime.js";

export type TimeRangeMinutes = {
  start: number;
  end: number;
};

/** True when ranges share at least one instant (touching edges do NOT overlap). */
export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Intersection of [aStart, aEnd] and [bStart, bEnd] in minutes.
 * Returns null when there is no overlap or the overlap length is zero.
 */
export function computeOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): TimeRangeMinutes | null {
  if (!rangesOverlap(aStart, aEnd, bStart, bEnd)) return null;

  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);

  if (start >= end) return null;

  return { start, end };
}

/** True when inner range is fully inside outer range (inclusive bounds). */
export function isRangeContainedIn(
  innerStart: number,
  innerEnd: number,
  outerStart: number,
  outerEnd: number,
): boolean {
  return innerStart >= outerStart && innerEnd <= outerEnd && innerStart < innerEnd;
}

export function timeRangeFromStrings(startTime: string, endTime: string): TimeRangeMinutes {
  return { start: timeToMinutes(startTime), end: timeToMinutes(endTime) };
}
