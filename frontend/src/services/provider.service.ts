import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./api";

export interface ProviderProfile {
  id: string;
  specialization: string | null;
  bio: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  slotDurationMinutes: number;
  isAcceptingBookings: boolean;
}

export type WorkingHour = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type ProviderServiceItem = {
  id: string;
  price: string;
  duration: number;
  isActive: boolean;
  service: {
    id: string;
    name: string;
    description: string | null;
    category?: { id: string; name: string };
  };
};

export type UpdateProviderProfilePayload = {
  specialization?: string;
  bio?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  slotDurationMinutes?: number;
  isAcceptingBookings?: boolean;
};

export type CreateWorkingHourPayload = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

export type CreateProviderServicePayload = {
  name: string;
  duration: number;
  price: number;
  description?: string;
};

export type UpdateProviderServicePayload = {
  name?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
};

function workingHoursBase(providerServiceId: string) {
  return `/provider/services/${providerServiceId}/working-hours`;
}

function normalizeWorkingHour(row: {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}): WorkingHour | Omit<WorkingHour, "id"> & { id?: string } {
  return {
    ...row,
    isActive: row.isActive ?? true,
  };
}

export async function getProviderProfile() {
  const res = await apiGet<ProviderProfile>("/provider/profile");
  return res.data;
}

export async function updateProviderProfile(data: UpdateProviderProfilePayload) {
  const res = await apiPatch<ProviderProfile>("/provider/profile", data);
  return res.data;
}

export function mapProviderProfileToForm(profile: ProviderProfile) {
  return {
    specialization: profile.specialization ?? "",
    bio: profile.bio ?? "",
    address: profile.address ?? "",
    latitude: profile.latitude ?? undefined,
    longitude: profile.longitude ?? undefined,
    slotDurationMinutes: profile.slotDurationMinutes,
    isAcceptingBookings: profile.isAcceptingBookings,
  };
}

export async function getWorkingHours(providerServiceId: string) {
  const res = await apiGet<WorkingHour[]>(workingHoursBase(providerServiceId));
  return res.data.map((row) => normalizeWorkingHour(row)) as WorkingHour[];
}

export async function createWorkingHour(
  providerServiceId: string,
  data: CreateWorkingHourPayload,
) {
  const res = await apiPost<WorkingHour[]>(workingHoursBase(providerServiceId), data);
  return res.data.map((row) => normalizeWorkingHour(row)) as WorkingHour[];
}

export async function replaceWorkingHours(
  providerServiceId: string,
  hours: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive?: boolean;
  }>,
) {
  const res = await apiPut<WorkingHour[]>(workingHoursBase(providerServiceId), { hours });
  return res.data.map((row) => normalizeWorkingHour(row)) as WorkingHour[];
}

export async function deleteWorkingHour(providerServiceId: string, id: string) {
  const res = await apiDelete<WorkingHour[]>(`${workingHoursBase(providerServiceId)}/${id}`);
  return res.data.map((row) => normalizeWorkingHour(row)) as WorkingHour[];
}

export async function updateWorkingHourStatus(
  providerServiceId: string,
  id: string,
  isActive: boolean,
) {
  const res = await apiPatch<WorkingHour[]>(
    `/provider/services/${providerServiceId}/working-hours/${id}/status`,
    { isActive },
  );
  return res.data.map((row) => normalizeWorkingHour(row)) as WorkingHour[];
}

export async function getProviderServices() {
  const res = await apiGet<ProviderServiceItem[]>("/provider/services");
  return res.data;
}

export async function createProviderService(data: CreateProviderServicePayload) {
  const res = await apiPost<ProviderServiceItem>("/provider/services", data);
  return res.data;
}

export async function updateProviderService(id: string, data: UpdateProviderServicePayload) {
  const res = await apiPatch<ProviderServiceItem>(`/provider/services/${id}`, data);
  return res.data;
}

export async function deleteProviderService(id: string) {
  const res = await apiDelete<{ deleted: boolean } | ProviderServiceItem>(`/provider/services/${id}`);
  return res.data;
}
