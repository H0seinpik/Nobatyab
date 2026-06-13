import { timeToMinutes } from "../../../shared/utils/datetime.js";

export const SLOT_STEP_MINUTES = 30;

export type SlotRecord = {
  id: string;
  providerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

export type ConsecutiveBlock = {
  providerId: string;
  date: string;
  startTime: string;
  endTime: string;
  slotIds: string[];
};

function sortSlots(slots: SlotRecord[]): SlotRecord[] {
  return [...slots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
}

function areConsecutive(prev: SlotRecord, next: SlotRecord): boolean {
  return prev.date === next.date && prev.endTime === next.startTime;
}

/** Group 30-minute slots into consecutive blocks matching service duration. */
export function findConsecutiveSlots(
  slots: SlotRecord[],
  durationMinutes: number,
): ConsecutiveBlock[] {
  if (durationMinutes <= 0 || durationMinutes % SLOT_STEP_MINUTES !== 0) {
    return [];
  }

  const slotsNeeded = durationMinutes / SLOT_STEP_MINUTES;
  const available = sortSlots(slots.filter((s) => !s.isBooked));
  if (available.length < slotsNeeded) return [];

  const blocks: ConsecutiveBlock[] = [];

  for (let i = 0; i <= available.length - slotsNeeded; i++) {
    let consecutive = true;
    for (let j = 0; j < slotsNeeded - 1; j++) {
      if (!areConsecutive(available[i + j], available[i + j + 1])) {
        consecutive = false;
        break;
      }
    }
    if (!consecutive) continue;

    const group = available.slice(i, i + slotsNeeded);
    blocks.push({
      providerId: group[0].providerId,
      date: group[0].date,
      startTime: group[0].startTime,
      endTime: group[group.length - 1].endTime,
      slotIds: group.map((s) => s.id),
    });
  }

  return blocks;
}
