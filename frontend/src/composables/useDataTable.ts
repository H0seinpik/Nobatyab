import { ref, watch, onMounted } from "vue";
import { fetchDataTable } from "@/services/dataTable.service";
import type { ListQueryState, PaginationMeta } from "@/types/dataTable";

export interface UseDataTableOptions {
  endpoint: string;
  defaultPageSize?: number;
  defaultSort?: string;
  immediate?: boolean;
}

export function useDataTable<T>(options: UseDataTableOptions) {
  const rows = ref([] as T[]);
  const meta = ref<PaginationMeta>({
    page: 1,
    pageSize: options.defaultPageSize ?? 20,
    total: 0,
    totalPages: 1,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedIds = ref<string[]>([]);

  const query = ref<ListQueryState>({
    page: 1,
    pageSize: options.defaultPageSize ?? 20,
    search: "",
    sort: options.defaultSort ?? "",
    filter: {},
  });

  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  let filterTimer: ReturnType<typeof setTimeout> | null = null;

  async function fetch() {
    loading.value = true;
    error.value = null;
    try {
      const result = await fetchDataTable<T>(options.endpoint, query.value);
      rows.value = result.rows;
      meta.value = {
        page: result.meta.page ?? query.value.page,
        pageSize: result.meta.pageSize ?? result.meta.limit ?? query.value.pageSize,
        total: result.meta.total ?? 0,
        totalPages: result.meta.totalPages ?? 1,
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "خطا در بارگذاری داده‌ها";
      rows.value = [];
    } finally {
      loading.value = false;
    }
  }

  function setPage(page: number) {
    query.value.page = page;
    fetch();
  }

  function setPageSize(pageSize: number) {
    query.value.pageSize = pageSize;
    query.value.page = 1;
    fetch();
  }

  function setSearch(search: string) {
    query.value.search = search;
    query.value.page = 1;
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(fetch, 300);
  }

  function setFilter(key: string, value: unknown) {
    const isEmptyContains =
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      "op" in value &&
      (value as { op: string; value?: unknown }).op === "contains" &&
      !String((value as { value?: unknown }).value ?? "").trim();

    if (value === "" || value === null || value === undefined || isEmptyContains) {
      const { [key]: _, ...rest } = query.value.filter;
      query.value.filter = rest;
    } else {
      query.value.filter = { ...query.value.filter, [key]: value };
    }
    query.value.page = 1;
    if (filterTimer) clearTimeout(filterTimer);
    filterTimer = setTimeout(fetch, 200);
  }

  function setSort(field: string, multi = false) {
    const parts = multi && query.value.sort ? query.value.sort.split(",") : [];
    const existing = parts.find((p) => p.startsWith(`${field}:`));
    let direction = "asc";
    if (existing) {
      direction = existing.endsWith(":asc") ? "desc" : "asc";
      const idx = parts.indexOf(existing);
      parts[idx] = `${field}:${direction}`;
    } else if (!multi) {
      parts.length = 0;
      parts.push(`${field}:asc`);
    } else {
      parts.push(`${field}:asc`);
    }
    query.value.sort = parts.join(",");
    query.value.page = 1;
    fetch();
  }

  function getSortDirection(field: string): "asc" | "desc" | null {
    const part = query.value.sort.split(",").find((p) => p.startsWith(`${field}:`));
    if (!part) return null;
    return part.endsWith(":desc") ? "desc" : "asc";
  }

  function toggleRow(id: string) {
    const idx = selectedIds.value.indexOf(id);
    if (idx >= 0) selectedIds.value.splice(idx, 1);
    else selectedIds.value.push(id);
  }

  function toggleAll(rowIds: string[]) {
    if (selectedIds.value.length === rowIds.length) selectedIds.value = [];
    else selectedIds.value = [...rowIds];
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  function refresh() {
    fetch();
  }

  if (options.immediate !== false) {
    onMounted(fetch);
  }

  watch(
    () => options.endpoint,
    () => {
      query.value.page = 1;
      fetch();
    },
  );

  return {
    rows,
    meta,
    loading,
    error,
    query,
    selectedIds,
    fetch,
    refresh,
    setPage,
    setPageSize,
    setSearch,
    setFilter,
    setSort,
    getSortDirection,
    toggleRow,
    toggleAll,
    clearSelection,
  };
}
