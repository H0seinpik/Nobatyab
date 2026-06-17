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
  fetchEdit?: (id: string) => Promise<T>;
  mapEditValues?: (row: Record<string, unknown>) => T;
  onSuccess?: () => void;
}

export function useCrudForm<T extends Record<string, unknown>>(options: UseCrudFormOptions<T>) {
  const isOpen = ref(false);
  const mode = ref<CrudMode>("create");
  const editingId = ref<string | null>(null);
  const formError = ref<string | null>(null);
  const formLoading = ref(false);

  const form = useZodForm(options.schemas.create, options.initialValues);

  const isBusy = computed(() => formLoading.value || form.submitting.value);

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
    formLoading.value = false;
    form.reset(structuredClone(options.initialValues));
    isOpen.value = true;
  }

  async function openEdit(row: Record<string, unknown>) {
    mode.value = "edit";
    editingId.value = String(row.id);
    formError.value = null;
    isOpen.value = true;

    if (options.fetchEdit) {
      formLoading.value = true;
      form.reset(structuredClone(options.initialValues));
      try {
        const values = await options.fetchEdit(editingId.value);
        form.reset(values);
      } catch {
        formError.value = "خطا در بارگذاری اطلاعات";
      } finally {
        formLoading.value = false;
      }
      return;
    }

    const values = options.mapEditValues
      ? options.mapEditValues(row)
      : (structuredClone(row) as T);
    form.reset(values);
  }

  function close() {
    if (formLoading.value || form.submitting.value) return;
    isOpen.value = false;
    formError.value = null;
    formLoading.value = false;
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
      isOpen.value = false;
      formError.value = null;
      formLoading.value = false;
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
    formLoading,
    isBusy,
    modalTitle,
    ...form,
    validateAll,
    openCreate,
    openEdit,
    close,
    submit,
  };
}
