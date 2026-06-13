import { SLOT_STEP_MINUTES } from "./findConsecutiveSlots.js";
import { timeToMinutes } from "../../../shared/utils/datetime.js";

export type TimeRange = {
  startTime: string;
  endTime: string;
};

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Build expected 30-minute slot start times from working-hour ranges for one day. */
export function buildExpectedStartTimes(
  dayHours: TimeRange[],
  stepMinutes = SLOT_STEP_MINUTES,
): Set<string> {
  const expected = new Set<string>();

  for (const range of dayHours) {
    let cursor = timeToMinutes(range.startTime);
    const rangeEnd = timeToMinutes(range.endTime);

    while (cursor + stepMinutes <= rangeEnd) {
      expected.add(minutesToTime(cursor));
      cursor += stepMinutes;
    }
  }

  return expected;
}

/** True when an unbooked persisted slot should be removed after a schedule change. */
export function isOrphanSlot(startTime: string, expectedStartTimes: Set<string>): boolean {
  return !expectedStartTimes.has(startTime);
}
