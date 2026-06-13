import { z } from "zod";

/** Prisma / seed IDs are not always classic cuids — accept any non-empty string. */
export const idSchema = z.string().min(1);

export function optionalId() {
  return z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    idSchema.optional(),
  );
}
