import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api";
import type {
  AvailabilityEntry,
  BookingSuggestion,
  ConfirmPayload,
  EnrichedSuggestion,
  SuggestPayload,
  SuggestResponse,
} from "@/types/smartBooking";

interface ProviderForEnrichment {
  id: string;
  bio: string | null;
  user: { fullName: string };
  providerServices: {
    id: string;
    price: string;
    duration: number;
    service: { id: string; name: string };
  }[];
}

export async function getUserAvailability() {
  const res = await apiGet<AvailabilityEntry[]>("/user/availability", undefined, {
    skipGlobalLoading: true,
  });
  return res.data;
}

export async function saveUserAvailability(entries: Omit<AvailabilityEntry, "id">[]) {
  const res = await apiPut<AvailabilityEntry[]>("/user/availability", { entries });
  return res.data;
}

export async function deleteUserAvailability(id: string) {
  const res = await apiDelete<AvailabilityEntry[]>(`/user/availability/${id}`);
  return res.data;
}

function buildSuggestBody(payload: SuggestPayload) {
  const body: SuggestPayload = {
    serviceId: payload.serviceId,
    preference: payload.preference ?? "time",
    horizonDays: payload.horizonDays ?? 14,
  };
  if (payload.providerId) body.providerId = payload.providerId;
  if (payload.providerServiceId) body.providerServiceId = payload.providerServiceId;
  return body;
}

export async function suggestBooking(payload: SuggestPayload) {
  const res = await apiPost<SuggestResponse>("/smart-booking/suggest", buildSuggestBody(payload));
  return res.data;
}

export async function confirmBooking(payload: ConfirmPayload) {
  const res = await apiPost<unknown>("/confirm-booking", {
    providerId: payload.providerId,
    providerServiceId: payload.providerServiceId,
    timeSlotIds: payload.timeSlotIds,
    ...(payload.notes ? { notes: payload.notes } : {}),
  });
  return res.data;
}

export async function enrichSuggestions(
  serviceId: string,
  serviceName: string,
  suggestions: BookingSuggestion[],
): Promise<EnrichedSuggestion[]> {
  if (suggestions.length === 0) return [];

  const res = await apiGet<ProviderForEnrichment[]>("/providers", { serviceId });
  const providers = res.data;

  const providerMap = new Map(providers.map((p) => [p.id, p]));
  const providerServiceMap = new Map<string, { price: string; serviceName: string }>();

  for (const provider of providers) {
    for (const ps of provider.providerServices) {
      if (ps.service.id === serviceId) {
        providerServiceMap.set(ps.id, { price: ps.price, serviceName: ps.service.name });
      }
    }
  }

  return suggestions.map((s) => {
    const provider = providerMap.get(s.providerId);
    const ps = providerServiceMap.get(s.providerServiceId);
    return {
      ...s,
      timeSlotIds: [...(s.timeSlotIds ?? [])],
      providerName: provider?.user.fullName ?? "ارائه‌دهنده",
      serviceName: ps?.serviceName ?? serviceName,
      price: Number(ps?.price ?? 0),
      locationLabel: provider?.bio?.slice(0, 80) || "موقعیت ارائه‌دهنده",
    };
  });
}

export function filterByPriceRange(
  suggestions: EnrichedSuggestion[],
  priceMin: number | null,
  priceMax: number | null,
): EnrichedSuggestion[] {
  return suggestions.filter((s) => {
    if (priceMin != null && s.price < priceMin) return false;
    if (priceMax != null && s.price > priceMax) return false;
    return true;
  });
}

export type WeeklyRange = { id?: string; startTime: string; endTime: string };

export function entriesToWeekly(
  entries: AvailabilityEntry[],
): Record<number, WeeklyRange[]> {
  const weekly: Record<number, WeeklyRange[]> = {};
  for (const entry of entries) {
    if (!weekly[entry.dayOfWeek]) weekly[entry.dayOfWeek] = [];
    weekly[entry.dayOfWeek].push({
      id: entry.id,
      startTime: entry.startTime,
      endTime: entry.endTime,
    });
  }
  return weekly;
}

export function weeklyToEntries(
  weekly: Record<number, WeeklyRange[]>,
): Omit<AvailabilityEntry, "id">[] {
  const entries: Omit<AvailabilityEntry, "id">[] = [];
  for (const [dayStr, ranges] of Object.entries(weekly)) {
    const dayOfWeek = Number(dayStr);
    for (const range of ranges) {
      if (range.startTime && range.endTime) {
        entries.push({ dayOfWeek, startTime: range.startTime, endTime: range.endTime });
      }
    }
  }
  return entries;
}
