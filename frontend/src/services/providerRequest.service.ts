import { apiGet, apiPost } from "@/services/api";

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
