<script setup lang="ts">
import { RouterLink } from "vue-router";
import MainNav from "./MainNav.vue";
import AuthControls from "./AuthControls.vue";
import ThemeToggle from "./ThemeToggle.vue";

defineProps<{
  showNav?: boolean;
}>();
</script>

<template>
  <header class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
      <RouterLink to="/" class="shrink-0 text-xl font-bold text-[var(--color-primary)]">نوبت‌یاب</RouterLink>
      <MainNav v-if="showNav !== false" class="hidden sm:flex" />
      <div class="flex items-center gap-2">
        <ThemeToggle />
        <AuthControls />
      </div>
    </div>
  </header>
</template>
