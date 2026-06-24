import { z } from "zod";

/** Matches Prisma Decimal(10, 2) — absolute value must be less than 10^8 */
export const MAX_DECIMAL_PRICE = 99_999_999.99;

export const priceSchema = z
  .number()
  .min(0, "price must be at least 0")
  .max(MAX_DECIMAL_PRICE, `price must not exceed ${MAX_DECIMAL_PRICE}`);

export const optionalPriceSchema = priceSchema.optional();
