import { env } from "../../config/env.js";

/** Parse "HH:mm" to minutes from midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Get day of week for APP_TIMEZONE (0=Sunday ... 6=Saturday) */
export function getLocalDayOfWeek(date: Date, timezone = env.app.timezone): number {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(date);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[weekday] ?? 0;
}

/** Build UTC Date from local date string YYYY-MM-DD and HH:mm in timezone */
export function localToUtc(dateStr: string, time: string, timezone = env.app.timezone): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const minutes = timeToMinutes(time);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, mins, 0));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const localFromGuess = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  const desiredLocal = Date.UTC(year, month - 1, day, hours, mins);
  const offset = localFromGuess - utcGuess.getTime();
  return new Date(desiredLocal - offset);
}

export function formatLocalDate(date: Date, timezone = env.app.timezone): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Format a UTC Date as HH:mm in APP_TIMEZONE */
export function formatLocalTime(date: Date, timezone = env.app.timezone): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}
