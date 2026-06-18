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
  <div v-if="hasActions" ref="rootRef" class="data-table-row-actions">
    <button
      ref="triggerRef"
      type="button"
      class="data-table-row-actions__trigger"
      @click.stop="toggle"
    >
      ⋮
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="menuRef"
        class="data-table-row-actions__menu"
        :style="menuStyle"
      >
        <button
          v-for="action in visibleActions"
          :key="action.key"
          type="button"
          class="data-table-row-actions__item"
          :class="{ 'data-table-row-actions__item--danger': action.variant === 'danger' }"
          @click="onAction(action.key)"
        >
          {{ action.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.data-table-row-actions {
  display: inline-block;
}

.data-table-row-actions__trigger {
  border-radius: 0.5rem;
  padding: 0.25rem;
  color: var(--color-muted);
  background: none;
  border: none;
  cursor: pointer;
}

.data-table-row-actions__trigger:hover {
  background-color: var(--color-bg);
}

.data-table-row-actions__menu {
  position: fixed;
  z-index: 9999;
  min-width: 10rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding-block: 0.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.data-table-row-actions__item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  text-align: right;
  font-size: 0.875rem;
  color: var(--color-text);
  background: none;
  border: none;
  cursor: pointer;
}

.data-table-row-actions__item:hover {
  background-color: var(--color-bg);
}

.data-table-row-actions__item--danger {
  color: var(--color-danger);
}
</style>
