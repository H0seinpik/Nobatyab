import { z } from "zod";

/** Iranian national ID (کد ملی) — 10 digits with checksum. */
export function isValidNationalCode(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;

  const check = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(code[i]) * (10 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

export const nationalCodeSchema = z
  .string()
  .regex(/^\d{10}$/, "National code must be 10 digits")
  .refine(isValidNationalCode, { message: "Invalid national code" });

export const iranianPhoneSchema = z
  .string()
  .regex(/^09\d{9}$/, "Phone must be a valid Iranian mobile number (09XXXXXXXXX)");
