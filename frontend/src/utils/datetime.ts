import dayjs from "dayjs";
import jalaliPlugin from "jalali-plugin-dayjs";

dayjs.extend(jalaliPlugin);

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
  return dayjs(date).format("HH:mm");
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
