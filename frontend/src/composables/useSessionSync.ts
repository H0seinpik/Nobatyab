import { onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const POLL_INTERVAL_MS = 30_000;

export function useSessionSync() {
  const auth = useAuthStore();
  const router = useRouter();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function checkSession() {
    if (!auth.isAuthenticated) return;

    const result = await auth.syncSession();
    if (result === "changed") {
      await auth.logout();
      await router.push({ name: "login", query: { reason: "session-changed" } });
    } else if (result === "invalid") {
      await auth.logout();
      await router.push({ name: "login", query: { reason: "session-expired" } });
    }
  }

  function startPolling() {
    stopPolling();
    if (!auth.isAuthenticated) return;
    intervalId = setInterval(checkSession, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === "visible") {
      void checkSession();
    }
  }

  watch(
    () => auth.isAuthenticated,
    (authenticated) => {
      if (authenticated) startPolling();
      else stopPolling();
    },
    { immediate: true },
  );

  onMounted(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
  });

  onUnmounted(() => {
    stopPolling();
    document.removeEventListener("visibilitychange", onVisibilityChange);
  });
}
