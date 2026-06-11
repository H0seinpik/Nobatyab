import { reactive, ref, computed, watch } from "vue";
import type { ZodType } from "zod";
import { extractFieldErrors, getFieldError, type FieldErrors } from "@/utils/validation/zodHelpers";

export function useZodForm<T extends Record<string, unknown>>(schema: ZodType<T>, initialValues: T) {
  const values = reactive(structuredClone(initialValues)) as T;
  const errors = ref<FieldErrors<T>>({});
  const touched = ref<Partial<Record<keyof T & string, boolean>>>({});
  const submitting = ref(false);
  const submitError = ref<string | null>(null);

  const isValid = computed(() => schema.safeParse(values).success);

  function touch(field: keyof T & string) {
    touched.value[field] = true;
    validateField(field);
  }

  function validateField(field: keyof T & string) {
    const message = getFieldError(schema, values, field);
    if (message) errors.value[field] = message;
    else delete errors.value[field];
    return !message;
  }

  function validateAll() {
    for (const key of Object.keys(values) as Array<keyof T & string>) {
      touched.value[key] = true;
    }
    const next = extractFieldErrors(schema, values);
    errors.value = next;
    return Object.keys(next).length === 0;
  }

  function fieldError(field: keyof T & string) {
    return touched.value[field] ? errors.value[field] : undefined;
  }

  function reset(next?: T) {
    const source = next ?? initialValues;
    Object.assign(values, structuredClone(source));
    errors.value = {};
    touched.value = {};
    submitError.value = null;
  }

  watch(
    values,
    () => {
      for (const field of Object.keys(touched.value) as Array<keyof T & string>) {
        if (touched.value[field]) validateField(field);
      }
    },
    { deep: true },
  );

  async function handleSubmit(fn: (data: T) => Promise<void>) {
    submitError.value = null;
    if (!validateAll()) return false;
    submitting.value = true;
    try {
      await fn(schema.parse(values));
      return true;
    } catch (e) {
      submitError.value = e instanceof Error ? e.message : "خطایی رخ داد";
      return false;
    } finally {
      submitting.value = false;
    }
  }

  return {
    values,
    errors,
    touched,
    submitting,
    submitError,
    isValid,
    touch,
    validateField,
    validateAll,
    fieldError,
    reset,
    handleSubmit,
  };
}
