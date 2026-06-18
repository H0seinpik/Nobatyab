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
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink to="/" class="app-header__logo">نوبت‌یاب</RouterLink>
      <div v-if="showNav !== false" class="app-header__nav">
        <MainNav />
      </div>
      <div class="app-header__controls">
        <ThemeToggle />
        <AuthControls />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.app-header__inner {
  display: flex;
  max-width: 72rem;
  margin-inline: auto;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
}

.app-header__logo {
  flex-shrink: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.app-header__nav {
  display: none;
}

@media (min-width: 640px) {
  .app-header__nav {
    display: flex;
  }
}

.app-header__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
