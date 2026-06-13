export const WEEKDAYS_FA = [
  { dayOfWeek: 6, label: "شنبه" },
  { dayOfWeek: 0, label: "یکشنبه" },
  { dayOfWeek: 1, label: "دوشنبه" },
  { dayOfWeek: 2, label: "سه‌شنبه" },
  { dayOfWeek: 3, label: "چهارشنبه" },
  { dayOfWeek: 4, label: "پنج‌شنبه" },
  { dayOfWeek: 5, label: "جمعه" },
] as const;

export function weekdayLabel(dayOfWeek: number): string {
  return WEEKDAYS_FA.find((d) => d.dayOfWeek === dayOfWeek)?.label ?? "";
}
