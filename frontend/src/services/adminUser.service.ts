import { apiGet, apiPatch, apiPost } from "./api";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  nationalCode: string | null;
  age: number | null;
  address: string | null;
  phone: string | null;
  role: "USER" | "PROVIDER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  providerProfile: { id: string } | null;
}

export type CreateAdminUserPayload = {
  email: string;
  password: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  nationalCode?: string;
  age?: number;
  address?: string;
  phone?: string;
  role: "USER" | "PROVIDER" | "ADMIN";
  isActive: boolean;
};

export type UpdateAdminUserPayload = Partial<Omit<CreateAdminUserPayload, "password">> & {
  password?: string;
};

export async function getAdminUser(id: string) {
  const res = await apiGet<AdminUser>(`/admin/users/${id}`, undefined, { skipGlobalLoading: true });
  return res.data;
}

export async function createAdminUser(data: CreateAdminUserPayload) {
  const res = await apiPost<AdminUser>("/admin/users", data);
  return res.data;
}

export async function updateAdminUser(id: string, data: UpdateAdminUserPayload) {
  const res = await apiPatch<AdminUser>(`/admin/users/${id}`, data);
  return res.data;
}

export function mapAdminUserToForm(user: AdminUser) {
  return {
    email: user.email,
    password: "",
    fullName: user.fullName,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    nationalCode: user.nationalCode ?? "",
    age: user.age ?? undefined,
    address: user.address ?? "",
    phone: user.phone ?? "",
    role: user.role,
    isActive: user.isActive,
  };
}
