import type { UserRole } from "@/stores/auth";

export function getNotificationsPath(role?: UserRole | null): string {
  if (role === "ADMIN") return "/admin/notifications";
  if (role === "PROVIDER") return "/provider/notifications";
  return "/notifications";
}

export function isNotificationsRoute(path: string): boolean {
  return (
    path === "/notifications" ||
    path === "/provider/notifications" ||
    path === "/admin/notifications"
  );
}
