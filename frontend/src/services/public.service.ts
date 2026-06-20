import { apiGet } from "./api";

export interface PublicStats {
  categories: number;
  services: number;
  providers: number;
  appointments: number;
  reviews: number;
  smartBookingEnabled: boolean;
}

export async function fetchPublicStats() {
  const res = await apiGet<PublicStats>("/public/stats");
  return res.data;
}
