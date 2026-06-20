<script setup lang="ts">
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";
import MainNav from "./MainNav.vue";
import { useScrollLock } from "@/composables/useScrollLock";

const open = defineModel<boolean>("open", { default: false });
const panelRef = ref<HTMLElement | null>(null);

useScrollLock(open);

watch(open, (isOpen) => {
  if (isOpen) {
    requestAnimationFrame(() => {
      panelRef.value?.querySelector<HTMLElement>(".main-nav__link")?.focus();
    });
  }
});

function close() {
  open.value = false;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="mobile-nav">
      <div
        v-if="open"
        class="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="منوی اصلی"
        @keydown="onKeydown"
      >
        <div class="mobile-nav__backdrop" aria-hidden="true" @click="close" />
        <aside ref="panelRef" class="mobile-nav__panel">
          <div class="mobile-nav__header">
            <span class="mobile-nav__title">منو</span>
            <button
              type="button"
              class="mobile-nav__close"
              aria-label="بستن منو"
              @click="close"
            >
              <X :size="20" />
            </button>
          </div>
          <nav class="mobile-nav__links" @click="close">
            <MainNav vertical />
          </nav>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  inset: 0;
  z-index: var(--z-dropdown);
}

.mobile-nav__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.mobile-nav__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(18rem, 85vw);
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-xl);
  border-inline-start: 1px solid var(--color-border);
}

.mobile-nav__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.mobile-nav__title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.mobile-nav__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  transition: background-color var(--transition-base), color var(--transition-base);
}

.mobile-nav__close:hover {
  background-color: var(--color-border-subtle);
  color: var(--color-text);
}

.mobile-nav__links {
  padding: var(--space-4);
  overflow-y: auto;
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity var(--transition-base);
}

.mobile-nav-enter-active .mobile-nav__panel,
.mobile-nav-leave-active .mobile-nav__panel {
  transition: transform var(--transition-slow);
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
}

.mobile-nav-enter-from .mobile-nav__panel,
.mobile-nav-leave-to .mobile-nav__panel {
  transform: translateX(100%);
}
</style>
