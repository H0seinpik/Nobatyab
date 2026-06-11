import { api, type ApiResponse } from "./api";
import type { ListQueryState, PaginationMeta } from "@/types/dataTable";

const SKIP_LOADING_HEADER = "X-Skip-Global-Loading";

export async function fetchDataTable<T>(endpoint: string, query: ListQueryState) {
  const res = await api.get<ApiResponse<T[]>>(endpoint, {
    params: {
      page: query.page,
      pageSize: query.pageSize,
      search: query.search || undefined,
      sort: query.sort || undefined,
      filter: Object.keys(query.filter).length ? JSON.stringify(query.filter) : undefined,
    },
    headers: { [SKIP_LOADING_HEADER]: "true" },
  });
  return {
    rows: res.data.data,
    meta: (res.data.meta ?? {
      page: query.page,
      pageSize: query.pageSize,
      total: 0,
      totalPages: 1,
    }) as unknown as PaginationMeta,
  };
}
