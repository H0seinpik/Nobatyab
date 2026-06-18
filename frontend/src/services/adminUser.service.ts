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

export type AdminUserFormPayload = {
  email: string;
  firstName: string;
  lastName: string;
  nationalCode?: string;
  age?: number;
  address?: string;
  phone?: string;
  role: "USER" | "PROVIDER" | "ADMIN";
  isActive: boolean;
};

export type CreateAdminUserPayload = AdminUserFormPayload & {
  password: string;
};

export type UpdateAdminUserPayload = Partial<AdminUserFormPayload> & {
  password?: string;
};

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
  };
}

function toApiPayload(data: CreateAdminUserPayload | UpdateAdminUserPayload): Record<string, unknown> {
  const { password, firstName, lastName, ...rest } = data;
  const payload: Record<string, unknown> = { ...rest };
  if (firstName !== undefined) payload.firstName = firstName;
  if (lastName !== undefined) payload.lastName = lastName;
  if (firstName !== undefined && lastName !== undefined) {
    payload.fullName = `${firstName} ${lastName}`.trim();
  }
  if (password) payload.password = password;
  return payload;
}

export async function getAdminUser(id: string) {
  const res = await apiGet<AdminUser>(`/admin/users/${id}`, undefined, { skipGlobalLoading: true });
  return res.data;
}

export async function createAdminUser(data: CreateAdminUserPayload) {
  const res = await apiPost<AdminUser>("/admin/users", toApiPayload(data));
  return res.data;
}

export async function updateAdminUser(id: string, data: UpdateAdminUserPayload) {
  const res = await apiPatch<AdminUser>(`/admin/users/${id}`, toApiPayload(data));
  return res.data;
}

export function mapAdminUserToForm(user: AdminUser) {
  const fromFullName = splitFullName(user.fullName);
  return {
    email: user.email,
    password: "",
    firstName: user.firstName ?? fromFullName.firstName,
    lastName: user.lastName ?? fromFullName.lastName,
    nationalCode: user.nationalCode ?? "",
    age: user.age ?? undefined,
    address: user.address ?? "",
    phone: user.phone ?? "",
    role: user.role,
    isActive: user.isActive,
  };
}
