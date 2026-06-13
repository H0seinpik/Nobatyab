import type { WorkingHours } from "@prisma/client";

/** Only working-hour rows that are enabled for booking. */
export function getActiveWorkingHours<T extends Pick<WorkingHours, "isActive">>(
  hours: T[],
): T[] {
  return hours.filter((h) => h.isActive);
}

export function getActiveHoursForDay<T extends { dayOfWeek: number; isActive: boolean }>(
  hours: T[],
  dayOfWeek: number,
): T[] {
  return hours.filter((h) => h.dayOfWeek === dayOfWeek && h.isActive);
}
