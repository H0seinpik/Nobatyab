import type { RowAction } from "@/types/dataTable";

export function crudRowActions(opts?: { canDelete?: boolean; extra?: RowAction[] }): RowAction[] {
  const actions: RowAction[] = [{ key: "edit", label: "ویرایش" }];
  if (opts?.extra) actions.push(...opts.extra);
  if (opts?.canDelete !== false) {
    actions.push({ key: "delete", label: "حذف", variant: "danger" });
  }
  return actions;
}

export function viewRowActions(opts?: { extra?: RowAction[] }): RowAction[] {
  const actions: RowAction[] = [{ key: "view", label: "مشاهده" }];
  if (opts?.extra) actions.push(...opts.extra);
  return actions;
}
