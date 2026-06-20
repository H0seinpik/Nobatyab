import { watch, onUnmounted, type Ref } from "vue";

export function useScrollLock(isLocked: Ref<boolean>) {
  watch(
    isLocked,
    (locked) => {
      document.body.style.overflow = locked ? "hidden" : "";
    },
    { immediate: true },
  );

  onUnmounted(() => {
    document.body.style.overflow = "";
  });
}
