import { apiGet, apiPatch, apiPost } from "@/services/api";

export interface ProviderRequest {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  adminNote: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
  };
}

export async function getMyProviderRequest() {
  const res = await apiGet<ProviderRequest | null>("/provider/request/me");
  return res.data;
}

export async function submitProviderRequest(note?: string) {
  const res = await apiPost<ProviderRequest>("/provider/request", { note: note || undefined });
  return res.data;
}

export async function listProviderRequests(status: ProviderRequest["status"] = "PENDING") {
  const res = await apiGet<ProviderRequest[]>("/admin/provider-requests", { status });
  return res.data;
}

export async function reviewProviderRequest(
  id: string,
  body: { status: "APPROVED" | "REJECTED"; adminNote?: string },
) {
  const res = await apiPatch<ProviderRequest>(`/admin/provider-requests/${id}`, body);
  return res.data;
}
