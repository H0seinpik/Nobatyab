import { apiGet, apiPatch, apiPost } from "@/services/api";

export interface ProviderRequestCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProviderRequest {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  adminNote: string | null;
  categoryId: string | null;
  proposedCategoryName: string | null;
  proposedCategoryDescription: string | null;
  createdCategoryId: string | null;
  proposedServiceName: string;
  proposedServiceDescription: string | null;
  proposedServicePrice: string | number;
  proposedServiceDuration: number;
  createdServiceId: string | null;
  createdAt: string;
  category?: ProviderRequestCategory | null;
  createdCategory?: ProviderRequestCategory | null;
  createdService?: { id: string; name: string } | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
  };
}

export interface SubmitProviderRequestInput {
  note?: string;
  categoryId?: string;
  proposedCategoryName?: string;
  proposedCategoryDescription?: string;
  proposedServiceName: string;
  proposedServiceDescription?: string;
  proposedServicePrice: number;
  proposedServiceDuration: number;
}

export async function getMyProviderRequest() {
  const res = await apiGet<ProviderRequest | null>("/provider/request/me");
  return res.data;
}

export async function submitProviderRequest(body: SubmitProviderRequestInput) {
  const res = await apiPost<ProviderRequest>("/provider/request", body);
  return res.data;
}

export async function listProviderRequests(status: ProviderRequest["status"] = "PENDING") {
  const res = await apiGet<ProviderRequest[]>("/admin/provider-requests", { status });
  return res.data;
}

export interface ReviewProviderRequestInput {
  status: "APPROVED" | "REJECTED";
  adminNote?: string;
  categoryName?: string;
  categorySlug?: string;
  categoryDescription?: string;
}

export async function reviewProviderRequest(id: string, body: ReviewProviderRequestInput) {
  const res = await apiPatch<ProviderRequest>(`/admin/provider-requests/${id}`, body);
  return res.data;
}
