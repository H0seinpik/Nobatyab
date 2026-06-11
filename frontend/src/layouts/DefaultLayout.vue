<script setup lang="ts">
import { RouterView } from "vue-router";
import AppShell from "@/components/layout/AppShell.vue";
</script>

<template>
  <AppShell>
    <div class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <RouterView />
    </div>
  </AppShell>
</template>
