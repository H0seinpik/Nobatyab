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
  max-width: 72rem;
  flex: 1;
  margin-inline: auto;
  padding: 2rem 1rem;
}
</style>
