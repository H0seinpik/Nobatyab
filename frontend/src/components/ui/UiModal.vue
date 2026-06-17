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

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

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
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="absolute inset-0 bg-black/50" @click="onOverlayClick" />
      <div
        class="relative flex max-h-[90vh] w-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        :class="sizeClass[size]"
      >
        <div
          v-if="title || $slots.header"
          class="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sm:px-6"
        >
          <slot name="header">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
          </slot>
          <button
            v-if="closable"
            type="button"
            class="rounded-lg p-1 text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
            aria-label="بستن"
            @click="close"
          >
            ✕
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <slot />
        </div>
        <div
          v-if="$slots.footer"
          class="shrink-0 border-t border-[var(--color-border)] px-4 py-3 sm:px-6"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
