import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export function useLogout() {
  const auth = useAuthStore();
  const router = useRouter();

  return async () => {
    await auth.logout();
    await router.push({ name: "login" });
  };
}
