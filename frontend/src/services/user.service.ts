import { apiGet, apiPost } from "./api";

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  image: string | null;
  email: string;
}

export interface DashboardAppointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  paymentStatus: string;
  providerService: { service: { name: string } };
  provider: { user: { fullName: string } };
}

export interface UserAppointmentsResponse {
  upcoming: DashboardAppointment[];
  completed: DashboardAppointment[];
}

export async function getUserProfile() {
  const res = await apiGet<UserProfile>("/user/profile", undefined, { skipGlobalLoading: true });
  return res.data;
}

export async function getUserAppointments() {
  const res = await apiGet<UserAppointmentsResponse>("/user/appointments", undefined, {
    skipGlobalLoading: true,
  });
  return res.data;
}

export async function changeUserPassword(currentPassword: string, newPassword: string) {
  const res = await apiPost<{ message: string }>("/user/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
}
