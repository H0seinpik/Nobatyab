import { z } from "zod";
import { timeToMinutes } from "../../shared/utils/datetime.js";
import { idSchema } from "../../shared/schemas/id.schema.js";

const availabilityEntrySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .superRefine((data, ctx) => {
    if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startTime must be before endTime",
        path: ["startTime"],
      });
    }
  });

export const replaceAvailabilitySchema = z.object({
  entries: z.array(availabilityEntrySchema),
});

export const availabilityIdSchema = z.object({ id: idSchema });
