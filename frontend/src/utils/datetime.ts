import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import jalaliPlugin from "jalali-plugin-dayjs";

dayjs.extend(relativeTime);
dayjs.extend(jalaliPlugin);

const APP_TIMEZONE = import.meta.env.VITE_APP_TIMEZONE || "Asia/Tehran";

export function toJalali(date: string | Date) {
  return dayjs(date).calendar("jalali");
}

export function formatJalaliDate(date: string | Date) {
  return dayjs(date).calendar("jalali").format("YYYY/MM/DD");
}

export function formatJalaliDateTime(date: string | Date) {
  return dayjs(date).calendar("jalali").format("YYYY/MM/DD HH:mm");
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

/** Convert Jalali YYYY/MM/DD to Gregorian YYYY-MM-DD for API */
export function jalaliToGregorianDate(jalaliDate: string): string {
  const normalized = jalaliDate.replace(/\//g, "-");
  return dayjs(normalized, { jalali: true } as never).format("YYYY-MM-DD");
}

export function todayGregorian(): string {
  return dayjs().format("YYYY-MM-DD");
}

export function todayJalali(): string {
  return dayjs().calendar("jalali").format("YYYY/MM/DD");
}

export function formatJalaliRelative(date: string | Date) {
  return dayjs(date).calendar("jalali").fromNow();
}

/** Normalize Jalali input (1403/01/15 or 1403-01-15) to ISO date string for API filters */
export function parseJalaliInput(jalaliDate: string): string {
  if (!jalaliDate.trim()) return "";
  return jalaliToGregorianDate(jalaliDate);
}

/** Convert ISO date to Jalali display string */
export function isoToJalali(iso: string | undefined | null): string {
  if (!iso) return "";
  return formatJalaliDate(iso);
}

export function gregorianToJalaliDate(date: string): string {
  return formatJalaliDate(date);
}

/** Gregorian YYYY-MM-DD — Saturday on or before the given date (Iranian week start). */
export function startOfWeekSaturday(gregorianDate?: string): string {
  const d = dayjs(gregorianDate);
  const daysSinceSaturday = (d.day() + 1) % 7;
  return d.subtract(daysSinceSaturday, "day").format("YYYY-MM-DD");
}

export function addGregorianDays(date: string, days: number): string {
  return dayjs(date).add(days, "day").format("YYYY-MM-DD");
}

/** Seven consecutive Gregorian dates starting at weekStart (Saturday). */
export function getWeekDayRange(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addGregorianDays(weekStart, i));
}

/** Jalali day-of-month for calendar cell display. */
export function gregorianToJalaliDayNumber(date: string): string {
  return dayjs(date).calendar("jalali").format("D");
}

/** Jalali month/year label for week navigation header. */
export function formatJalaliWeekLabel(weekStart: string): string {
  const start = dayjs(weekStart).calendar("jalali");
  const end = dayjs(addGregorianDays(weekStart, 6)).calendar("jalali");
  if (start.format("YYYY/MM") === end.format("YYYY/MM")) {
    return start.format("MMMM YYYY");
  }
  return `${start.format("MMMM")} – ${end.format("MMMM YYYY")}`;
}
