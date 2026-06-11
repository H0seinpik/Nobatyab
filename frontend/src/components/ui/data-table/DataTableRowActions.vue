<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { RowAction } from "@/types/dataTable";

const props = defineProps<{
  row: Record<string, unknown>;
  actions: RowAction[];
}>();

const emit = defineEmits<{ action: [key: string, row: Record<string, unknown>] }>();

const open = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const visibleActions = () => props.actions.filter((a) => !a.hidden?.(props.row));

function toggle() {
  open.value = !open.value;
}

function onAction(key: string) {
  open.value = false;
  emit("action", key, props.row);
}

function onClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      type="button"
      class="rounded-lg p-1 text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
      @click.stop="toggle"
    >
      ⋮
    </button>
    <div
      v-if="open && visibleActions().length"
      class="absolute left-0 z-20 min-w-[10rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
    >
      <button
        v-for="action in visibleActions()"
        :key="action.key"
        type="button"
        class="block w-full px-3 py-2 text-right text-sm hover:bg-[var(--color-bg)]"
        :class="action.variant === 'danger' ? 'text-red-600' : ''"
        @click="onAction(action.key)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>
