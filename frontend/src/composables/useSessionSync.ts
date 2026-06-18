import { onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getMyProviderRequest } from "@/services/providerRequest.service";

const DEFAULT_POLL_INTERVAL_MS = 30_000;
const PENDING_REQUEST_POLL_INTERVAL_MS = 5_000;

export function useSessionSync() {
  const auth = useAuthStore();
  const router = useRouter();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let pollIntervalMs = DEFAULT_POLL_INTERVAL_MS;

  async function hasPendingProviderRequest(): Promise<boolean> {
    if (auth.user?.role !== "USER") return false;
    try {
      const request = await getMyProviderRequest();
      return request?.status === "PENDING";
    } catch {
      return false;
    }
  }

  async function resolvePollInterval() {
    const pending = await hasPendingProviderRequest();
    pollIntervalMs = pending ? PENDING_REQUEST_POLL_INTERVAL_MS : DEFAULT_POLL_INTERVAL_MS;
  }

  async function handleSessionChange() {
    await auth.logout();
    await router.push({ name: "login", query: { reason: "session-changed" } });
  }

  async function checkSession() {
    if (!auth.isAuthenticated) return;

    const result = await auth.syncSession();
    if (result === "changed") {
      await handleSessionChange();
      return;
    }
    if (result === "invalid") {
      await auth.logout();
      await router.push({ name: "login", query: { reason: "session-expired" } });
      return;
    }

    const previousInterval = pollIntervalMs;
    await resolvePollInterval();
    if (pollIntervalMs !== previousInterval) {
      startPolling();
    }
  }

  function startPolling() {
    stopPolling();
    if (!auth.isAuthenticated) return;
    void resolvePollInterval().then(() => {
      intervalId = setInterval(checkSession, pollIntervalMs);
    });
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
    void checkSession();
  });

  onUnmounted(() => {
    stopPolling();
    document.removeEventListener("visibilitychange", onVisibilityChange);
  });
}
