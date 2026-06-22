import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import jalaliPlugin from "jalali-plugin-dayjs";
import { normalizeDigits, toPersianDigits } from "@/utils/numbers";

dayjs.extend(relativeTime);
dayjs.extend(jalaliPlugin);

const APP_TIMEZONE = import.meta.env.VITE_APP_TIMEZONE || "Asia/Tehran";

const persianMonthYearFormatter = new Intl.DateTimeFormat("fa-IR", {
  calendar: "persian",
  month: "long",
  year: "numeric",
  timeZone: APP_TIMEZONE,
});

const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR", {
  calendar: "persian",
  month: "long",
  timeZone: APP_TIMEZONE,
});

export function toJalali(date: string | Date) {
  return dayjs(date).calendar("jalali");
}

/** ASCII Jalali YYYY/MM/DD for internal model values and API conversion */
function formatJalaliDateAscii(date: string | Date): string {
  return dayjs(date).calendar("jalali").format("YYYY/MM/DD");
}

export function formatJalaliDate(date: string | Date) {
  return toPersianDigits(formatJalaliDateAscii(date));
}

export function formatJalaliDateTime(date: string | Date) {
  return toPersianDigits(dayjs(date).calendar("jalali").format("YYYY/MM/DD HH:mm"));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}

/** True when the appointment start time is now or earlier. */
export function isAppointmentInPast(startAt: string | Date): boolean {
  return new Date(startAt).getTime() <= Date.now();
}

/** Convert Jalali YYYY/MM/DD to Gregorian YYYY-MM-DD for API */
export function jalaliToGregorianDate(jalaliDate: string): string {
  const normalized = normalizeDigits(jalaliDate).replace(/\//g, "-");
  const parsed = dayjs(normalized, { jalali: true } as never);
  if (!parsed.isValid()) return "";
  const gregorian = parsed.format("YYYY-MM-DD");
  return gregorian === "Invalid Date" ? "" : gregorian;
}

export function isValidJalaliDate(jalaliDate: string): boolean {
  return jalaliToGregorianDate(jalaliDate) !== "";
}

export function todayGregorian(): string {
  return dayjs().format("YYYY-MM-DD");
}

export function todayJalali(): string {
  return formatJalaliDate(new Date());
}

export function formatJalaliRelative(date: string | Date) {
  return toPersianDigits(dayjs(date).calendar("jalali").fromNow());
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
  return formatJalaliDateAscii(date);
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
  return toPersianDigits(dayjs(date).calendar("jalali").format("D"));
}

/** Earliest allowed week start (Saturday of current week). */
export function minAllowedWeekStart(): string {
  return startOfWeekSaturday(todayGregorian());
}

/** Clamp week start so past weeks cannot be navigated to. */
export function clampWeekStart(weekStart: string): string {
  const min = minAllowedWeekStart();
  return weekStart < min ? min : weekStart;
}

function formatPersianMonthYear(date: string): string {
  return toPersianDigits(persianMonthYearFormatter.format(new Date(`${date}T12:00:00`)));
}

function formatPersianMonth(date: string): string {
  return toPersianDigits(persianMonthFormatter.format(new Date(`${date}T12:00:00`)));
}

/** Jalali month/year label for week navigation header. */
export function formatJalaliWeekLabel(weekStart: string): string {
  const weekEnd = addGregorianDays(weekStart, 6);
  const startMonth = formatPersianMonth(weekStart);
  const endMonth = formatPersianMonth(weekEnd);
  if (startMonth === endMonth) {
    return formatPersianMonthYear(weekStart);
  }
  return `${startMonth} – ${formatPersianMonthYear(weekEnd)}`;
}
