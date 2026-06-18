<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import type { RowAction } from "@/types/dataTable";
import { getVisibleRowActions } from "@/config/statuses";

const props = defineProps<{
  row: Record<string, unknown>;
  actions: RowAction[];
}>();

const emit = defineEmits<{ action: [key: string, row: Record<string, unknown>] }>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuStyle = ref({ top: "0px", left: "0px" });

const visibleActions = computed(() => getVisibleRowActions(props.actions, props.row));
const hasActions = computed(() => visibleActions.value.length > 0);

function updatePosition() {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const menuWidth = 160;
  const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
  menuStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${Math.max(8, left)}px`,
  };
}

function toggle() {
  if (!hasActions.value) return;
  open.value = !open.value;
  if (open.value) nextTick(updatePosition);
}

function onAction(key: string) {
  open.value = false;
  emit("action", key, props.row);
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (rootRef.value?.contains(target)) return;
  if (menuRef.value?.contains(target)) return;
  open.value = false;
}

watch(open, (isOpen) => {
  if (isOpen) {
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
  } else {
    window.removeEventListener("scroll", updatePosition, true);
    window.removeEventListener("resize", updatePosition);
  }
});

onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
});
</script>

<template>
  <div v-if="hasActions" ref="rootRef" class="inline-block">
    <button
      ref="triggerRef"
      type="button"
      class="rounded-lg p-1 text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
      @click.stop="toggle"
    >
      ⋮
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="fixed z-[9999] min-w-[10rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
        :style="menuStyle"
      >
        <button
          v-for="action in visibleActions"
          :key="action.key"
          type="button"
          class="block w-full px-3 py-2 text-right text-sm hover:bg-[var(--color-bg)]"
          :class="action.variant === 'danger' ? 'text-red-600' : ''"
          @click="onAction(action.key)"
        >
          {{ action.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
