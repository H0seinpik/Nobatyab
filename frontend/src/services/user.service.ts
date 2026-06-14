import { apiGet, apiPost, apiPatch } from "./api";

export interface UserProfile {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  nationalCode: string | null;
  age: number | null;
  phone: string | null;
  address: string | null;
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

export type UpdateUserProfilePayload = {
  firstName?: string;
  lastName?: string;
  nationalCode?: string;
  age?: number;
  phone?: string;
  address?: string;
  email?: string;
};

export async function getUserProfile() {
  const res = await apiGet<UserProfile>("/user/profile", undefined, { skipGlobalLoading: true });
  return res.data;
}

export async function updateUserProfile(data: UpdateUserProfilePayload) {
  const res = await apiPatch<UserProfile>("/user/profile", data);
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
