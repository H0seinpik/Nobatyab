<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useLoadingStore } from "@/stores/loading";

const { showBar } = storeToRefs(useLoadingStore());
</script>

<template>
  <Transition name="bar-fade">
    <div v-if="showBar" class="loading-bar-wrap">
      <div class="loading-bar" />
    </div>
  </Transition>
</template>

<style scoped>
.loading-bar-wrap {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 9999;
  height: 2px;
  overflow: hidden;
  background-color: var(--color-border);
}

.loading-bar {
  height: 100%;
  width: 40%;
  background-color: var(--color-primary);
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
