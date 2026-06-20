<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Menu } from "lucide-vue-next";
import MainNav from "./MainNav.vue";
import AuthControls from "./AuthControls.vue";
import ThemeToggle from "./ThemeToggle.vue";
import MobileNav from "./MobileNav.vue";

defineProps<{
  showNav?: boolean;
}>();

const mobileOpen = ref(false);
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner container">
      <div class="app-header__start">
        <button
          v-if="showNav !== false"
          type="button"
          class="app-header__menu-btn"
          aria-label="باز کردن منو"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = true"
        >
          <Menu :size="22" />
        </button>
        <RouterLink to="/" class="app-header__logo">نوبت‌یاب</RouterLink>
      </div>
      <div v-if="showNav !== false" class="app-header__nav">
        <MainNav />
      </div>
      <div class="app-header__controls">
        <ThemeToggle />
        <AuthControls />
      </div>
    </div>
    <MobileNav v-if="showNav !== false" v-model:open="mobileOpen" />
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  border-bottom: 1px solid var(--color-border);
  background-color: color-mix(in srgb, var(--color-surface) 85%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.app-header__inner {
  display: flex;
  min-height: var(--header-height);
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-2);
}

.app-header__start {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.app-header__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.app-header__menu-btn:hover {
  background-color: var(--color-border-subtle);
}

@media (min-width: 640px) {
  .app-header__menu-btn {
    display: none;
  }
}

.app-header__logo {
  flex-shrink: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
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
  gap: var(--space-2);
}
</style>
