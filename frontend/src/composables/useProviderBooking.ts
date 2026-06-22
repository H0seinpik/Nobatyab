import { ref, watch, computed } from "vue";
import axios from "axios";
import { apiGet, apiPost } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { useToast } from "@/composables/useToast";
import { useSlotHoldCountdown } from "@/composables/useCountdown";
import { guestBookingFormSchema } from "@/schemas/appointment.schema";
import {
  clampWeekStart,
  gregorianToJalaliDate,
  isAppointmentInPast,
  isValidJalaliDate,
  jalaliToGregorianDate,
  minAllowedWeekStart,
  todayGregorian,
} from "@/utils/datetime";
import type { SlotDto, AvailableDaysDto } from "@/types/booking";
import { extractApiError, getApiErrorMessage } from "@/utils/apiError";
import { fetchProviderReviews } from "@/services/review.service";

export interface ProviderDetail {
  id: string;
  bio: string | null;
  specialization: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  slotDurationMinutes: number;
  avgRating: number;
  reviewCount: number;
  user: { fullName: string; phone: string | null; avatarUrl: string | null };
  providerServices: {
    id: string;
    price: string;
    duration: number;
    service: { id: string; name: string };
  }[];
  cancellationPolicy?: { minHoursBefore: number; description: string | null } | null;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  authorName: string;
}

export function useProviderBooking(providerId: string, catalogServiceId?: string) {
  const auth = useAuthStore();
  const toast = useToast();

  const provider = ref<ProviderDetail | null>(null);
  const reviews = ref<ReviewItem[]>([]);
  const selectedServiceId = ref("");
  const isServiceLocked = ref(false);
  const jalaliDate = ref("");
  const weekStart = ref(minAllowedWeekStart());
  const slots = ref<SlotDto[]>([]);
  const availableDates = ref<string[]>([]);
  const selectedSlot = ref<SlotDto | null>(null);
  const loading = ref(true);
  const slotsLoading = ref(false);
  const daysLoading = ref(false);
  const booking = ref(false);
  const bookingError = ref("");
  const slotsError = ref("");
  const bookingStep = ref(1);
  let daysFetchSeq = 0;
  let slotsFetchSeq = 0;

  const minWeekStart = computed(() => minAllowedWeekStart());

  const visibleSlots = computed(() =>
    slots.value.filter(
      (slot) => slot.status !== "past" && !isAppointmentInPast(slot.startAt),
    ),
  );

  const { formatted: countdownFormatted, isExpired, active: holdActive, startHold, clearHold } =
    useSlotHoldCountdown(() => {
      selectedSlot.value = null;
      toast.warning("زمان رزرو به پایان رسید", "لطفاً زمان دیگری انتخاب کنید");
    });

  const {
    values: guestValues,
    fieldError,
    touch,
    validateAll,
  } = useZodForm(guestBookingFormSchema, {
    guestFullName: "",
    guestPhone: "",
    guestEmail: "",
    notes: "",
  });

  const canBook = computed(() => {
    if (!selectedSlot.value || !selectedServiceId.value || !jalaliDate.value) return false;
    if (isAppointmentInPast(selectedSlot.value.startAt)) return false;
    if (holdActive.value && isExpired.value) return false;
    if (auth.isAuthenticated) return true;
    return guestBookingFormSchema.safeParse(guestValues).success;
  });

  const selectedProviderService = computed(() =>
    provider.value?.providerServices.find((ps) => ps.id === selectedServiceId.value) ?? null,
  );

  function clearDateSelection() {
    jalaliDate.value = "";
    selectedSlot.value = null;
    slots.value = [];
    clearHold();
  }

  function filterFutureDates(dates: string[]): string[] {
    const today = todayGregorian();
    return dates.filter((d) => d >= today);
  }

  function ensureValidDateSelection() {
    if (jalaliDate.value) {
      const selectedGregorian = jalaliToGregorianDate(jalaliDate.value);
      if (selectedGregorian && availableDates.value.includes(selectedGregorian)) return;
      clearDateSelection();
    }
    const first = availableDates.value[0];
    if (first) jalaliDate.value = gregorianToJalaliDate(first);
  }

  async function fetchAvailableDays() {
    if (!selectedServiceId.value) return;
    const seq = ++daysFetchSeq;
    daysLoading.value = true;
    slotsError.value = "";
    try {
      const clampedWeek = clampWeekStart(weekStart.value);
      if (clampedWeek !== weekStart.value) weekStart.value = clampedWeek;

      const res = await apiGet<AvailableDaysDto>(`/providers/${providerId}/available-days`, {
        providerServiceId: selectedServiceId.value,
        from: weekStart.value,
        horizonDays: 7,
      });
      if (seq !== daysFetchSeq) return;
      availableDates.value = filterFutureDates(res.data.dates);
      ensureValidDateSelection();
    } catch (e: unknown) {
      if (seq !== daysFetchSeq) return;
      availableDates.value = [];
      clearDateSelection();
      slotsError.value = getApiErrorMessage(e, "بارگذاری تاریخ‌های قابل رزرو ناموفق بود");
    } finally {
      if (seq === daysFetchSeq) daysLoading.value = false;
    }
  }

  async function fetchSlots() {
    if (!selectedServiceId.value || !jalaliDate.value) {
      slots.value = [];
      slotsError.value = "";
      return;
    }
    if (!isValidJalaliDate(jalaliDate.value)) {
      slots.value = [];
      slotsError.value = "";
      return;
    }
    const seq = ++slotsFetchSeq;
    slotsLoading.value = true;
    selectedSlot.value = null;
    clearHold();
    slotsError.value = "";
    try {
      const date = jalaliToGregorianDate(jalaliDate.value);
      if (!date) {
        slots.value = [];
        return;
      }
      const res = await apiGet<SlotDto[]>(`/providers/${providerId}/slots`, {
        date,
        providerServiceId: selectedServiceId.value,
      });
      if (seq !== slotsFetchSeq) return;
      slots.value = res.data;
      bookingStep.value = 2;
    } catch (e: unknown) {
      if (seq !== slotsFetchSeq) return;
      slots.value = [];
      slotsError.value = getApiErrorMessage(e, "بارگذاری بازه‌های زمانی ناموفق بود");
    } finally {
      if (seq === slotsFetchSeq) slotsLoading.value = false;
    }
  }

  async function init() {
    const res = await apiGet<ProviderDetail>(`/providers/${providerId}`);
    provider.value = res.data;
    if (catalogServiceId) {
      const match = res.data.providerServices.find((ps) => ps.service.id === catalogServiceId);
      if (match) {
        selectedServiceId.value = match.id;
        isServiceLocked.value = true;
      } else if (res.data.providerServices.length) {
        selectedServiceId.value = res.data.providerServices[0].id;
      }
    } else if (res.data.providerServices.length) {
      selectedServiceId.value = res.data.providerServices[0].id;
    }
    try {
      const revRes = await fetchProviderReviews(providerId);
      reviews.value = revRes.data;
    } catch {
      reviews.value = [];
    }
    loading.value = false;
  }

  watch(selectedServiceId, () => {
    if (isServiceLocked.value) return;
    clearDateSelection();
    weekStart.value = minAllowedWeekStart();
    bookingStep.value = 1;
  });

  watch([selectedServiceId, weekStart], async ([serviceId]) => {
    if (!serviceId) return;
    await fetchAvailableDays();
  });

  watch([selectedServiceId, jalaliDate], async () => {
    await fetchSlots();
  });

  function onWeekChange(newWeekStart: string) {
    weekStart.value = clampWeekStart(newWeekStart);
  }

  function onSlotSelect(slot: SlotDto) {
    if (slot.status && slot.status !== "available") return;
    if (isAppointmentInPast(slot.startAt)) return;
    selectedSlot.value = slot;
    startHold();
    bookingStep.value = 3;
  }

  async function book() {
    if (booking.value) return;
    bookingError.value = "";
    if (!selectedSlot.value || !selectedServiceId.value) {
      bookingError.value = "لطفاً تاریخ و زمان نوبت را انتخاب کنید";
      return;
    }
    if (isAppointmentInPast(selectedSlot.value.startAt)) {
      bookingError.value = "امکان رزرو زمان گذشته وجود ندارد. لطفاً زمان دیگری انتخاب کنید.";
      selectedSlot.value = null;
      clearHold();
      return;
    }
    if (!auth.isAuthenticated && !validateAll()) return;

    booking.value = true;
    try {
      await apiPost("/appointments", {
        providerId,
        providerServiceId: selectedServiceId.value,
        startAt: selectedSlot.value.startAt,
        notes: guestValues.notes || undefined,
        guestFullName: auth.isAuthenticated ? undefined : guestValues.guestFullName,
        guestPhone: auth.isAuthenticated ? undefined : guestValues.guestPhone,
        guestEmail: auth.isAuthenticated ? undefined : guestValues.guestEmail || undefined,
      });
      toast.success("نوبت با موفقیت ثبت شد");
      selectedSlot.value = null;
      clearHold();
      bookingStep.value = 1;
    } catch (e: unknown) {
      const { message } = extractApiError(e, "خطا در ثبت نوبت");
      bookingError.value = message;
      toast.error(message);
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        selectedSlot.value = null;
        clearHold();
        await fetchSlots();
      }
    } finally {
      booking.value = false;
    }
  }

  return {
    provider,
    reviews,
    selectedServiceId,
    selectedProviderService,
    isServiceLocked,
    jalaliDate,
    weekStart,
    minWeekStart,
    slots,
    visibleSlots,
    availableDates,
    selectedSlot,
    loading,
    slotsLoading,
    daysLoading,
    booking,
    bookingError,
    slotsError,
    bookingStep,
    countdownFormatted,
    isExpired,
    holdActive,
    guestValues,
    fieldError,
    touch,
    canBook,
    onWeekChange,
    onSlotSelect,
    book,
    init,
  };
}
