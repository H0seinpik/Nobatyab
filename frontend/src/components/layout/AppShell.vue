<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";

defineProps<{
  showNav?: boolean;
}>();
</script>

<template>
  <div class="app-shell">
    <AppHeader :show-nav="showNav" />
    <main class="app-shell__main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.app-shell__main {
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>
