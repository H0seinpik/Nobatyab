import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  confirmBooking,
  enrichSuggestions,
  filterByPriceRange,
  getUserAvailability,
  saveUserAvailability,
  suggestBooking,
} from "@/services/smartBooking.service";
import type {
  AvailabilityEntry,
  BookingPreference,
  CatalogService,
  EnrichedSuggestion,
  BookingSuggestion,
} from "@/types/smartBooking";
import axios from "axios";

/** 1=availability, 2=service, 3=preferences, 4=suggestions */
export const STEP_AVAILABILITY = 1;
export const STEP_SERVICE = 2;
export const STEP_PREFERENCES = 3;
export const STEP_SUGGESTIONS = 4;

function parseApiError(e: unknown, fallback = "خطا در انجام عملیات"): string {
  if (!axios.isAxiosError(e)) return fallback;

  const err = e.response?.data?.error;
  const msg = err?.message as string | undefined;

  if (msg?.toLowerCase().includes("availability")) {
    return "لطفاً ابتدا زمان‌های آزاد خود را تنظیم کنید";
  }

  const fieldErrors = err?.details?.fieldErrors as Record<string, string[]> | undefined;
  if (fieldErrors) {
    const first = Object.values(fieldErrors).flat()[0];
    if (first) {
      const lower = first.toLowerCase();
      if (lower.includes("cuid") || lower.includes("uuid")) {
        return "شناسه خدمت نامعتبر است. لطفاً دوباره خدمت را انتخاب کنید.";
      }
      return first;
    }
  }

  return msg ?? fallback;
}

function isValidSuggestion(s: EnrichedSuggestion | null): s is EnrichedSuggestion {
  return !!(
    s?.providerId &&
    s?.providerServiceId &&
    Array.isArray(s.timeSlotIds) &&
    s.timeSlotIds.length > 0 &&
    s.timeSlotIds.every((id) => typeof id === "string" && id.length > 0)
  );
}

export const useSmartBookingStore = defineStore("smartBooking", () => {
  const step = ref(STEP_AVAILABILITY);
  const availabilityEntries = ref<AvailabilityEntry[]>([]);
  const selectedService = ref<CatalogService | null>(null);
  const preference = ref<BookingPreference>("time");
  const priceMin = ref<number | null>(null);
  const priceMax = ref<number | null>(null);
  const suggestions = ref<BookingSuggestion[]>([]);
  const enrichedSuggestions = ref<EnrichedSuggestion[]>([]);
  const selectedSuggestion = ref<EnrichedSuggestion | null>(null);
  const loading = ref(false);
  const initializing = ref(false);
  const confirming = ref(false);
  const error = ref<string | null>(null);
  const emptyMessage = ref<string | null>(null);
  const confirmError = ref<string | null>(null);
  const priceFilterEmpty = ref(false);

  const hasAvailability = computed(() => availabilityEntries.value.length > 0);
  const hasSuggestions = computed(() => enrichedSuggestions.value.length > 0);

  function reset() {
    step.value = STEP_AVAILABILITY;
    availabilityEntries.value = [];
    selectedService.value = null;
    preference.value = "time";
    priceMin.value = null;
    priceMax.value = null;
    suggestions.value = [];
    enrichedSuggestions.value = [];
    selectedSuggestion.value = null;
    loading.value = false;
    confirming.value = false;
    error.value = null;
    emptyMessage.value = null;
    confirmError.value = null;
    priceFilterEmpty.value = false;
  }

  async function initWizard() {
    initializing.value = true;
    error.value = null;
    try {
      availabilityEntries.value = await getUserAvailability();
      // Always start with availability so the user confirms their free time slots first
      step.value = STEP_AVAILABILITY;
    } catch {
      error.value = "خطا در بارگذاری زمان‌های آزاد";
      step.value = STEP_AVAILABILITY;
    } finally {
      initializing.value = false;
    }
  }

  async function saveAvailability(entries: Omit<AvailabilityEntry, "id">[]) {
    loading.value = true;
    error.value = null;
    try {
      availabilityEntries.value = await saveUserAvailability(entries);
      clearSuggestionCache();
      step.value = STEP_SERVICE;
    } catch {
      error.value = "خطا در ذخیره زمان‌های آزاد";
      throw new Error("save failed");
    } finally {
      loading.value = false;
    }
  }

  function clearSuggestionCache() {
    suggestions.value = [];
    enrichedSuggestions.value = [];
    selectedSuggestion.value = null;
    confirmError.value = null;
    emptyMessage.value = null;
    priceFilterEmpty.value = false;
  }

  function syncAvailabilityEntries(entries: AvailabilityEntry[]) {
    availabilityEntries.value = entries;
    clearSuggestionCache();
  }

  function selectService(service: CatalogService) {
    if (!service?.id) {
      error.value = "خدمت انتخاب‌شده نامعتبر است";
      return;
    }
    selectedService.value = service;
    step.value = STEP_PREFERENCES;
    error.value = null;
  }

  function goToStep(target: number) {
    step.value = target;
    error.value = null;
  }

  async function fetchSuggestions() {
    error.value = null;
    emptyMessage.value = null;
    priceFilterEmpty.value = false;

    if (!hasAvailability.value) {
      error.value = "ابتدا زمان‌های آزاد هفتگی خود را مشخص کنید";
      step.value = STEP_AVAILABILITY;
      return;
    }

    const serviceId = selectedService.value?.id;
    if (!serviceId) {
      error.value = "لطفاً یک خدمت انتخاب کنید";
      step.value = STEP_SERVICE;
      return;
    }

    loading.value = true;
    suggestions.value = [];
    enrichedSuggestions.value = [];

    try {
      const result = await suggestBooking({
        serviceId,
        preference: preference.value === "location" ? "location" : "time",
        horizonDays: 14,
      });

      suggestions.value = result.suggestions ?? [];

      if (suggestions.value.length === 0) {
        emptyMessage.value = result.message ?? "زمان مناسبی پیدا نشد";
        step.value = STEP_SUGGESTIONS;
        return;
      }

      const enriched = await enrichSuggestions(
        serviceId,
        selectedService.value!.name,
        suggestions.value,
      );
      enrichedSuggestions.value = filterByPriceRange(enriched, priceMin.value, priceMax.value);

      if (enrichedSuggestions.value.length === 0) {
        priceFilterEmpty.value = true;
      }

      step.value = STEP_SUGGESTIONS;
    } catch (e: unknown) {
      const message = parseApiError(e, "خطا در دریافت پیشنهادها");
      error.value = message;
      if (message.includes("زمان‌های آزاد")) {
        step.value = STEP_AVAILABILITY;
      }
    } finally {
      loading.value = false;
    }
  }

  function selectSuggestion(suggestion: EnrichedSuggestion) {
    selectedSuggestion.value = {
      ...suggestion,
      timeSlotIds: [...(suggestion.timeSlotIds ?? [])],
    };
    confirmError.value = null;
  }

  function clearSelectedSuggestion() {
    selectedSuggestion.value = null;
    confirmError.value = null;
  }

  async function confirmSelected(
    suggestionOverride?: EnrichedSuggestion | null,
  ): Promise<"ok" | "conflict" | "error"> {
    if (confirming.value) return "error";

    const suggestion = suggestionOverride ?? selectedSuggestion.value;

    if (!isValidSuggestion(suggestion)) {
      confirmError.value =
        "پیشنهاد انتخاب‌شده نامعتبر است. لطفاً دوباره از لیست پیشنهادها انتخاب کنید.";
      return "error";
    }

    confirming.value = true;
    confirmError.value = null;

    try {
      await confirmBooking({
        providerId: suggestion.providerId,
        providerServiceId: suggestion.providerServiceId,
        timeSlotIds: suggestion.timeSlotIds,
      });
      return "ok";
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        const msg = (e.response?.data?.error?.message as string | undefined)?.toLowerCase() ?? "";
        clearSelectedSuggestion();
        error.value =
          msg.includes("already booked") || msg.includes("no longer available")
            ? "این زمان قبلاً رزرو شده است. لطفاً پیشنهاد دیگری انتخاب کنید."
            : "این زمان دیگر در دسترس نیست. لطفاً پیشنهاد دیگری انتخاب کنید.";
        await fetchSuggestions();
        return "conflict";
      }
      confirmError.value = parseApiError(e, "خطا در ثبت نوبت. لطفاً دوباره تلاش کنید");
      return "error";
    } finally {
      confirming.value = false;
    }
  }

  return {
    step,
    availabilityEntries,
    selectedService,
    preference,
    priceMin,
    priceMax,
    suggestions,
    enrichedSuggestions,
    selectedSuggestion,
    loading,
    initializing,
    confirming,
    error,
    emptyMessage,
    confirmError,
    priceFilterEmpty,
    hasAvailability,
    hasSuggestions,
    reset,
    initWizard,
    saveAvailability,
    syncAvailabilityEntries,
    selectService,
    goToStep,
    fetchSuggestions,
    selectSuggestion,
    clearSelectedSuggestion,
    confirmSelected,
    STEP_AVAILABILITY,
    STEP_SERVICE,
    STEP_PREFERENCES,
    STEP_SUGGESTIONS,
  };
});
