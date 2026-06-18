import type { UserRole } from "@/stores/auth";

export function decodeAccessTokenRole(token: string | null): UserRole | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      role?: UserRole;
    };
    return decoded.role ?? null;
  } catch {
    return null;
  }
}
