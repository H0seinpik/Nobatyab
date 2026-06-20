import { apiGet } from "./api";
import { formatPersianNumber } from "@/utils/numbers";

export interface AnalyticsOverview {
  users: number;
  providers: number;
  appointments: number;
  appointmentsThisMonth: number;
  pendingServiceRequests: number;
  pendingProviderRequests: number;
  services: number;
  revenue: number;
}

export interface AnalyticsTrends {
  labels: string[];
  appointments: number[];
  revenue: number[];
}

export function fetchAnalyticsOverview() {
  return apiGet<AnalyticsOverview>("/admin/analytics/overview");
}

export function fetchAnalyticsTrends(months = 6) {
  return apiGet<AnalyticsTrends>("/admin/analytics/trends", { months });
}

export function formatOverviewStats(data: AnalyticsOverview) {
  return [
    { label: "کاربران", value: formatPersianNumber(data.users), icon: "users" as const },
    { label: "ارائه‌دهندگان", value: formatPersianNumber(data.providers), icon: "briefcase" as const },
    { label: "نوبت‌ها", value: formatPersianNumber(data.appointments), icon: "calendar" as const },
    {
      label: "نوبت این ماه",
      value: formatPersianNumber(data.appointmentsThisMonth),
      icon: "calendar" as const,
    },
    {
      label: "درآمد (تومان)",
      value: formatPersianNumber(data.revenue),
      icon: "star" as const,
    },
    { label: "خدمات فعال", value: formatPersianNumber(data.services), icon: "briefcase" as const },
    {
      label: "درخواست خدمت",
      value: formatPersianNumber(data.pendingServiceRequests),
      icon: "calendar" as const,
    },
    {
      label: "درخواست ارائه‌دهنده",
      value: formatPersianNumber(data.pendingProviderRequests),
      icon: "users" as const,
    },
  ];
}
