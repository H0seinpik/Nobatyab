import type { Prisma } from "@prisma/client";
import { ApiError } from "./apiError.js";
import { parseFilterJson, type BaseListQuery } from "../schemas/listQuery.schema.js";

export type SortDirection = "asc" | "desc";

export interface FilterFieldConfig {
  prismaPath: string;
  type: "string" | "boolean" | "enum" | "date" | "number";
}

export interface SearchFieldConfig {
  prismaPath: string;
}

export interface QueryBuilderConfig {
  sortableFields: Record<string, string>;
  filterableFields: Record<string, FilterFieldConfig>;
  searchFields?: SearchFieldConfig[];
  defaultSort: Array<{ field: string; direction: SortDirection }>;
  softDeleteField?: string;
}

export interface BuiltListQuery {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  where: Record<string, unknown>;
  orderBy: Record<string, unknown> | Array<Record<string, unknown>>;
}

type FilterOp = { op: string; value?: unknown; gte?: unknown; lte?: unknown };

function setNested(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!cur[key] || typeof cur[key] !== "object") cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function buildSearchWhere(
  search: string | undefined,
  fields: SearchFieldConfig[] | undefined,
): Record<string, unknown> | undefined {
  if (!search?.trim() || !fields?.length) return undefined;
  const term = search.trim();
  const orClauses: Record<string, unknown>[] = [];

  for (const { prismaPath } of fields) {
    if (prismaPath.includes(".")) {
      const [relation, field] = prismaPath.split(".");
      orClauses.push({
        [relation]: { [field]: { contains: term, mode: "insensitive" } },
      });
    } else {
      orClauses.push({ [prismaPath]: { contains: term, mode: "insensitive" } });
    }
  }

  return orClauses.length ? { OR: orClauses } : undefined;
}

function buildFilterWhere(
  rawFilter: Record<string, unknown>,
  filterableFields: Record<string, FilterFieldConfig>,
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(rawFilter)) {
    const fieldConfig = filterableFields[key];
    if (!fieldConfig) continue;

    const { prismaPath, type } = fieldConfig;

    if (type === "date" && raw && typeof raw === "object" && !Array.isArray(raw)) {
      const range = raw as { gte?: string; lte?: string; op?: string; value?: unknown };
      const dateFilter: Record<string, Date> = {};
      if (range.gte) dateFilter.gte = new Date(String(range.gte));
      if (range.lte) dateFilter.lte = new Date(String(range.lte));
      if (range.op === "between" && Array.isArray(range.value) && range.value.length === 2) {
        dateFilter.gte = new Date(String(range.value[0]));
        dateFilter.lte = new Date(String(range.value[1]));
      }
      if (Object.keys(dateFilter).length) setNested(where, prismaPath, dateFilter);
      continue;
    }

    if (raw && typeof raw === "object" && !Array.isArray(raw) && "op" in raw) {
      const { op, value } = raw as FilterOp;
      switch (op) {
        case "eq":
          setNested(where, prismaPath, value);
          break;
        case "contains":
          setNested(where, prismaPath, { contains: String(value), mode: "insensitive" });
          break;
        case "in":
          setNested(where, prismaPath, { in: Array.isArray(value) ? value : [value] });
          break;
        case "gte":
          setNested(where, prismaPath, { gte: type === "date" ? new Date(String(value)) : value });
          break;
        case "lte":
          setNested(where, prismaPath, { lte: type === "date" ? new Date(String(value)) : value });
          break;
        case "between":
          if (Array.isArray(value) && value.length === 2) {
            const range =
              type === "date"
                ? { gte: new Date(String(value[0])), lte: new Date(String(value[1])) }
                : { gte: value[0], lte: value[1] };
            setNested(where, prismaPath, range);
          }
          break;
        default:
          break;
      }
      continue;
    }

    if (type === "boolean") {
      const boolVal = raw === true || raw === "true";
      setNested(where, prismaPath, boolVal);
    } else {
      setNested(where, prismaPath, raw);
    }
  }

  return where;
}

function parseSort(
  sort: string | undefined,
  config: QueryBuilderConfig,
): Array<Record<string, unknown>> {
  const clauses: Array<Record<string, unknown>> = [];

  if (sort) {
    for (const part of sort.split(",")) {
      const [field, dir] = part.trim().split(":");
      const prismaPath = config.sortableFields[field];
      if (!prismaPath || (dir !== "asc" && dir !== "desc" && dir !== undefined)) continue;
      const direction = (dir === "asc" ? "asc" : "desc") as SortDirection;
      if (prismaPath.includes(".")) {
        const [relation, sub] = prismaPath.split(".");
        clauses.push({ [relation]: { [sub]: direction } });
      } else {
        clauses.push({ [prismaPath]: direction });
      }
    }
  }

  if (!clauses.length) {
    for (const { field, direction } of config.defaultSort) {
      const prismaPath = config.sortableFields[field] ?? field;
      if (prismaPath.includes(".")) {
        const [relation, sub] = prismaPath.split(".");
        clauses.push({ [relation]: { [sub]: direction } });
      } else {
        clauses.push({ [prismaPath]: direction });
      }
    }
  }

  return clauses;
}

function mergeWhere(...parts: Array<Record<string, unknown> | undefined>): Record<string, unknown> {
  const active = parts.filter(Boolean) as Record<string, unknown>[];
  if (!active.length) return {};
  if (active.length === 1) return active[0];
  return { AND: active };
}

export function buildListQuery(config: QueryBuilderConfig, raw: BaseListQuery): BuiltListQuery {
  let filterObj: Record<string, unknown> = {};
  try {
    filterObj = parseFilterJson(raw.filter);
  } catch {
    throw ApiError.badRequest("Invalid filter JSON");
  }

  const page = raw.page;
  const pageSize = raw.pageSize ?? raw.limit ?? 20;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const searchWhere = buildSearchWhere(raw.search, config.searchFields);
  const filterWhere = buildFilterWhere(filterObj, config.filterableFields);
  const softDeleteWhere = config.softDeleteField ? { [config.softDeleteField]: null } : undefined;

  const where = mergeWhere(searchWhere, filterWhere, softDeleteWhere);
  const orderBy = parseSort(raw.sort, config);

  return {
    page,
    pageSize,
    skip,
    take,
    where,
    orderBy: orderBy.length === 1 ? orderBy[0] : orderBy,
  };
}

export const userListConfig: QueryBuilderConfig = {
  sortableFields: {
    createdAt: "createdAt",
    fullName: "fullName",
    email: "email",
    role: "role",
  },
  filterableFields: {
    role: { prismaPath: "role", type: "enum" },
    isActive: { prismaPath: "isActive", type: "boolean" },
  },
  searchFields: [
    { prismaPath: "email" },
    { prismaPath: "fullName" },
    { prismaPath: "phone" },
  ],
  defaultSort: [{ field: "createdAt", direction: "desc" }],
};

export const serviceListConfig: QueryBuilderConfig = {
  sortableFields: {
    name: "name",
    basePrice: "basePrice",
    createdAt: "createdAt",
  },
  filterableFields: {
    categoryId: { prismaPath: "categoryId", type: "string" },
    isActive: { prismaPath: "isActive", type: "boolean" },
  },
  searchFields: [{ prismaPath: "name" }, { prismaPath: "description" }],
  defaultSort: [{ field: "name", direction: "asc" }],
};

export const appointmentListConfig: QueryBuilderConfig = {
  sortableFields: {
    startAt: "startAt",
    status: "status",
    createdAt: "createdAt",
    paymentStatus: "paymentStatus",
  },
  filterableFields: {
    status: { prismaPath: "status", type: "enum" },
    paymentStatus: { prismaPath: "paymentStatus", type: "enum" },
    startAt: { prismaPath: "startAt", type: "date" },
  },
  searchFields: [{ prismaPath: "user.fullName" }, { prismaPath: "guestFullName" }],
  defaultSort: [{ field: "startAt", direction: "desc" }],
};

export type PrismaWhere = Prisma.UserWhereInput | Prisma.ServiceWhereInput | Prisma.AppointmentWhereInput;
