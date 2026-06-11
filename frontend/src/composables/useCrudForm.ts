import { ref, computed } from "vue";
import type { ZodType } from "zod";
import { useZodForm } from "./useZodForm";
import { extractFieldErrors } from "@/utils/validation/zodHelpers";

export type CrudMode = "create" | "edit";

export interface UseCrudFormOptions<T extends Record<string, unknown>> {
  schemas: { create: ZodType<T>; update: ZodType<Partial<T>> };
  initialValues: T;
  create?: (data: T) => Promise<unknown>;
  update?: (id: string, data: Partial<T>) => Promise<unknown>;
  mapEditValues?: (row: Record<string, unknown>) => T;
  onSuccess?: () => void;
}

export function useCrudForm<T extends Record<string, unknown>>(options: UseCrudFormOptions<T>) {
  const isOpen = ref(false);
  const mode = ref<CrudMode>("create");
  const editingId = ref<string | null>(null);
  const formError = ref<string | null>(null);

  const form = useZodForm(options.schemas.create, options.initialValues);

  function validateAll() {
    for (const key of Object.keys(form.values) as Array<keyof T & string>) {
      form.touched.value[key] = true;
    }
    const schema = mode.value === "create" ? options.schemas.create : options.schemas.update;
    const next = extractFieldErrors(schema, form.values);
    form.errors.value = next;
    return Object.keys(next).length === 0;
  }

  function openCreate() {
    mode.value = "create";
    editingId.value = null;
    formError.value = null;
    form.reset(structuredClone(options.initialValues));
    isOpen.value = true;
  }

  function openEdit(row: Record<string, unknown>) {
    mode.value = "edit";
    editingId.value = String(row.id);
    formError.value = null;
    const values = options.mapEditValues
      ? options.mapEditValues(row)
      : (structuredClone(row) as T);
    form.reset(values);
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    formError.value = null;
  }

  async function submit() {
    formError.value = null;
    if (!validateAll()) return false;

    form.submitting.value = true;
    try {
      if (mode.value === "create") {
        const data = options.schemas.create.parse(form.values);
        await options.create?.(data);
      } else {
        const data = options.schemas.update.parse(form.values);
        if (!editingId.value) throw new Error("missing id");
        await options.update?.(editingId.value, data);
      }
      options.onSuccess?.();
      close();
      return true;
    } catch {
      formError.value = "عملیات ناموفق بود";
      return false;
    } finally {
      form.submitting.value = false;
    }
  }

  const modalTitle = computed(() => (mode.value === "create" ? "افزودن" : "ویرایش"));

  return {
    isOpen,
    mode,
    editingId,
    formError,
    modalTitle,
    ...form,
    validateAll,
    openCreate,
    openEdit,
    close,
    submit,
  };
}
