<script setup lang="ts">
const model = defineModel<boolean>({ default: true });

defineProps<{
  label?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <label
    class="inline-flex cursor-pointer items-center gap-2 text-sm"
    :class="disabled ? 'cursor-not-allowed opacity-50' : ''"
  >
    <span
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition"
      :class="model ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'"
    >
      <input
        v-model="model"
        type="checkbox"
        class="peer sr-only"
        :disabled="disabled"
      />
      <span
        class="inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
        :class="model ? 'translate-x-5' : 'translate-x-0.5'"
      />
    </span>
    <span v-if="label">{{ label }}</span>
  </label>
</template>
