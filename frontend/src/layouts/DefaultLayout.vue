<script setup lang="ts">
import { RouterView } from "vue-router";
import AppShell from "@/components/layout/AppShell.vue";
</script>

<template>
  <AppShell>
    <div class="default-layout">
      <RouterView />
    </div>
  </AppShell>
</template>

<style scoped>
.default-layout {
  width: 100%;
  max-width: var(--container-max);
  flex: 1;
  margin-inline: auto;
  padding: var(--space-8) var(--space-4);
}

@media (min-width: 640px) {
  .default-layout {
    padding-inline: var(--space-6);
  }
}
</style>
