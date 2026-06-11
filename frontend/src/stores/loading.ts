import { defineStore } from "pinia";
import { ref, computed } from "vue";

const MIN_DELAY_MS = 300;

export const useLoadingStore = defineStore("loading", () => {
  const pendingCount = ref(0);
  const startedAt = ref<number | null>(null);
  const showBar = ref(false);
  let delayTimer: ReturnType<typeof setTimeout> | null = null;

  const isLoading = computed(() => pendingCount.value > 0);

  function start() {
    pendingCount.value++;
    if (pendingCount.value === 1) {
      startedAt.value = Date.now();
      delayTimer = setTimeout(() => {
        if (pendingCount.value > 0) showBar.value = true;
      }, MIN_DELAY_MS);
    }
  }

  function stop() {
    if (pendingCount.value <= 0) return;
    pendingCount.value--;
    if (pendingCount.value === 0) {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      const elapsed = startedAt.value ? Date.now() - startedAt.value : MIN_DELAY_MS;
      const remaining = Math.max(0, MIN_DELAY_MS - elapsed);
      setTimeout(() => {
        showBar.value = false;
        startedAt.value = null;
      }, remaining);
    }
  }

  function reset() {
    pendingCount.value = 0;
    showBar.value = false;
    startedAt.value = null;
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
  }

  return { pendingCount, isLoading, showBar, start, stop, reset };
});
