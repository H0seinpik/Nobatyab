import { ref, watch } from "vue";
import { apiGet } from "@/services/api";
import type { SlotDto, AvailableDaysDto } from "@/types/booking";
import { formatTime, formatJalaliDate } from "@/utils/datetime";

export function useHeroPreview(providerId: () => string | undefined) {
  const slots = ref<SlotDto[]>([]);
  const previewDate = ref("");
  const previewPrice = ref<number | null>(null);
  const previewDuration = ref<number | null>(null);
  const loading = ref(false);

  async function load() {
    const id = providerId();
    if (!id) {
      slots.value = [];
      previewDate.value = "";
      previewPrice.value = null;
      previewDuration.value = null;
      return;
    }

    loading.value = true;
    try {
      const providerRes = await apiGet<{
        providerServices: { price: string; duration: number; service: { name: string } }[];
      }>(`/providers/${id}`);

      const firstService = providerRes.data.providerServices[0];
      if (firstService) {
        previewPrice.value = Number(firstService.price);
        previewDuration.value = firstService.duration;
      }

      const daysRes = await apiGet<AvailableDaysDto>(`/providers/${id}/available-days`);
      const firstDate = daysRes.data.dates[0];
      if (!firstDate) {
        slots.value = [];
        previewDate.value = "";
        return;
      }

      previewDate.value = firstDate;
      const slotsRes = await apiGet<SlotDto[]>(`/providers/${id}/slots`, { date: firstDate });
      slots.value = (slotsRes.data ?? []).filter((s) => (s.status ?? "available") === "available").slice(0, 6);
    } catch {
      slots.value = [];
      previewDate.value = "";
    } finally {
      loading.value = false;
    }
  }

  watch(providerId, load, { immediate: true });

  function formatSlotTime(iso: string) {
    return formatTime(iso);
  }

  function formatDateLabel(date: string) {
    return formatJalaliDate(date);
  }

  return {
    slots,
    previewDate,
    previewPrice,
    previewDuration,
    loading,
    formatSlotTime,
    formatDateLabel,
    reload: load,
  };
}
