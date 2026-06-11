import { z } from "zod";

export const baseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().max(200).optional(),
  sort: z.string().max(500).optional(),
  filter: z.string().optional(),
});

export type BaseListQuery = z.infer<typeof baseListQuerySchema>;

export function parseFilterJson(raw?: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Filter must be a JSON object");
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("Invalid filter JSON");
  }
}
