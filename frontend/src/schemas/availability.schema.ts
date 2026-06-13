import { z } from "zod";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const timeRangeSchema = z
  .object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "فرمت زمان نامعتبر است"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "فرمت زمان نامعتبر است"),
  })
  .refine((data) => timeToMinutes(data.startTime) < timeToMinutes(data.endTime), {
    message: "ساعت پایان باید بعد از ساعت شروع باشد",
    path: ["endTime"],
  });

export const availabilityEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const saveAvailabilitySchema = z.object({
  entries: z.array(availabilityEntrySchema),
});

export function validateWeeklyRanges(
  ranges: { startTime: string; endTime: string }[],
): string | null {
  for (const range of ranges) {
    const result = timeRangeSchema.safeParse(range);
    if (!result.success) {
      return result.error.issues[0]?.message ?? "بازه زمانی نامعتبر است";
    }
  }
  return null;
}
