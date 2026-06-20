import { apiGet, apiPost } from "./api";

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  authorName: string;
}

export interface RatingSummary {
  avgRating: number;
  reviewCount: number;
}

export function fetchProviderReviews(providerId: string, page = 1) {
  return apiGet<Review[]>(`/providers/${providerId}/reviews`, { page, limit: 10 });
}

export function fetchRatingSummary(providerId: string) {
  return apiGet<RatingSummary>(`/providers/${providerId}/rating-summary`);
}

export function submitReview(appointmentId: string, data: { rating: number; comment?: string }) {
  return apiPost(`/appointments/${appointmentId}/review`, data);
}
