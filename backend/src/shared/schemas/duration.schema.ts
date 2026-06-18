import { z } from "zod";

export const SERVICE_DURATION_MIN = 30;
export const SERVICE_DURATION_STEP = 30;

export const serviceDurationSchema = z
  .number()
  .int()
  .min(SERVICE_DURATION_MIN, `duration must be at least ${SERVICE_DURATION_MIN} minutes`)
  .refine((d) => d % SERVICE_DURATION_STEP === 0, {
    message: `duration must be a multiple of ${SERVICE_DURATION_STEP} minutes`,
  });

export const optionalServiceDurationSchema = serviceDurationSchema.optional();
