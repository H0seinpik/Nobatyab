import { formatLocalTime, timeToMinutes } from "../../shared/utils/datetime.js";

export type TimeRange = {
  startTime: string;
  endTime: string;
};

export function appointmentFitsWorkingHours(
  dayHours: TimeRange[],
  startTime: string,
  durationMinutes: number,
): boolean {
  const start = timeToMinutes(startTime);
  const end = start + durationMinutes;

  return dayHours.some(
    (range) =>
      start >= timeToMinutes(range.startTime) && end <= timeToMinutes(range.endTime),
  );
}

export function appointmentFitsWorkingHoursAt(
  dayHours: TimeRange[],
  date: Date,
  durationMinutes: number,
): boolean {
  return appointmentFitsWorkingHours(dayHours, formatLocalTime(date), durationMinutes);
}
