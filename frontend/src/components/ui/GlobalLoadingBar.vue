<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useLoadingStore } from "@/stores/loading";

const { showBar } = storeToRefs(useLoadingStore());
</script>

<template>
  <Transition name="bar-fade">
    <div
      v-if="showBar"
      class="fixed inset-x-0 top-0 z-[9999] h-0.5 overflow-hidden bg-[var(--color-border)]"
    >
      <div class="loading-bar h-full bg-[var(--color-primary)]" />
    </div>
  </Transition>
</template>

<style scoped>
.loading-bar {
  width: 40%;
  animation: loading-slide 1s ease-in-out infinite;
}

@keyframes loading-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(350%);
  }
}

.bar-fade-enter-active,
.bar-fade-leave-active {
  transition: opacity 0.15s ease;
}
.bar-fade-enter-from,
.bar-fade-leave-to {
  opacity: 0;
}
</style>
