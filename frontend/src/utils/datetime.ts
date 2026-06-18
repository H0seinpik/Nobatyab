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
