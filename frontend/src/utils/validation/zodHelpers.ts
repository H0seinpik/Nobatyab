import type { ZodType } from "zod";

export type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T & string, string>>;

export function extractFieldErrors<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  data: unknown,
): FieldErrors<T> {
  const result = schema.safeParse(data);
  if (result.success) return {};

  const errors: FieldErrors<T> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key as keyof T & string]) {
      errors[key as keyof T & string] = issue.message;
    }
  }
  return errors;
}

export function getFieldError<T extends Record<string, unknown>>(
  schema: ZodType<T>,
  data: unknown,
  field: keyof T & string,
): string | undefined {
  const result = schema.safeParse(data);
  if (result.success) return undefined;
  const issue = result.error.issues.find((i) => i.path[0] === field);
  return issue?.message;
}
