<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    size?: "sm" | "md" | "lg";
    closeOnOverlay?: boolean;
    closable?: boolean;
  }>(),
  { size: "md", closeOnOverlay: true, closable: true },
);

const emit = defineEmits<{ close: [] }>();

function close() {
  if (!props.closable) return;
  open.value = false;
  emit("close");
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && open.value && props.closable) close();
}

function onOverlayClick() {
  if (props.closeOnOverlay && props.closable) close();
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="modal__overlay" @click="onOverlayClick" />
      <div class="modal__panel" :class="`modal__panel--${size}`">
        <div v-if="title || $slots.header" class="modal__header">
          <slot name="header">
            <h2 class="modal__title">{{ title }}</h2>
          </slot>
          <button
            v-if="closable"
            type="button"
            class="modal__close"
            aria-label="بستن"
            @click="close"
          >
            ✕
          </button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal__overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal__panel {
  position: relative;
  display: flex;
  max-height: 90vh;
  width: 100%;
  flex-direction: column;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal__panel--sm {
  max-width: 28rem;
}

.modal__panel--md {
  max-width: 32rem;
}

.modal__panel--lg {
  max-width: 42rem;
}

.modal__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
}

@media (min-width: 640px) {
  .modal__header {
    padding: 0.75rem 1.5rem;
  }
}

.modal__title {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal__close {
  border: none;
  border-radius: 0.5rem;
  padding: 0.25rem;
  background: transparent;
  color: var(--color-muted);
}

.modal__close:hover {
  background-color: var(--color-bg);
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

@media (min-width: 640px) {
  .modal__body {
    padding: 1rem 1.5rem;
  }
}

.modal__footer {
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
}

@media (min-width: 640px) {
  .modal__footer {
    padding: 0.75rem 1.5rem;
  }
}
</style>
