import { ref, computed, onUnmounted, watch } from "vue";

export function useCountdown(seconds: number, onExpire?: () => void) {
  const remaining = ref(seconds);
  let timer: ReturnType<typeof setInterval> | undefined;

  const formatted = computed(() => {
    const m = Math.floor(remaining.value / 60);
    const s = remaining.value % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  });

  const isExpired = computed(() => remaining.value <= 0);

  function start(duration = seconds) {
    stop();
    remaining.value = duration;
    timer = setInterval(() => {
      remaining.value -= 1;
      if (remaining.value <= 0) {
        stop();
        onExpire?.();
      }
    }, 1000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  onUnmounted(stop);

  return { remaining, formatted, isExpired, start, stop };
}

export function useSlotHoldCountdown(onExpire?: () => void) {
  const HOLD_SECONDS = 300;
  const countdown = useCountdown(HOLD_SECONDS, onExpire);
  const active = ref(false);

  watch(countdown.isExpired, (expired) => {
    if (expired) active.value = false;
  });

  function startHold() {
    active.value = true;
    countdown.start(HOLD_SECONDS);
  }

  function clearHold() {
    active.value = false;
    countdown.stop();
  }

  return { ...countdown, active, startHold, clearHold, holdSeconds: HOLD_SECONDS };
}
