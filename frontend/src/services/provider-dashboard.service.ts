import { apiGet } from "./api";

export interface ProviderDashboardOverview {
  todayAppointments: number;
  pendingConfirmations: number;
  completedThisMonth: number;
  revenueThisMonth: number;
  activeServices: number;
}

export async function fetchProviderDashboardOverview() {
  const res = await apiGet<ProviderDashboardOverview>("/provider/dashboard/overview");
  return res.data;
}
