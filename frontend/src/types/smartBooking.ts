export interface AvailabilityEntry {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CatalogService {
  id: string;
  name: string;
  description: string | null;
  defaultDuration: number;
  basePrice: string;
  category?: { name: string };
}

export interface BookingSuggestion {
  providerId: string;
  providerServiceId: string;
  startTime: string;
  endTime: string;
  timeSlotIds: string[];
  score: number;
  isFallback: boolean;
}

export interface EnrichedSuggestion extends BookingSuggestion {
  providerName: string;
  serviceName: string;
  price: number;
  locationLabel: string;
}

export interface SuggestResponse {
  suggestions: BookingSuggestion[];
  message?: string;
}

export interface SuggestPayload {
  serviceId: string;
  providerServiceId?: string;
  providerId?: string;
  preference?: "time" | "location";
  horizonDays?: number;
}

export interface ConfirmPayload {
  providerId: string;
  providerServiceId: string;
  timeSlotIds: string[];
  notes?: string;
}

export type BookingPreference = "time" | "location";

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export type WeeklyAvailability = Record<number, TimeRange[]>;
