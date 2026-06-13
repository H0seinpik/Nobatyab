<script setup lang="ts">
defineProps<{
  step: number;
}>();

const steps = [
  { num: 1, label: "زمان‌های آزاد" },
  { num: 2, label: "انتخاب خدمت" },
  { num: 3, label: "ترجیحات" },
  { num: 4, label: "پیشنهادها" },
];
</script>

<template>
  <div class="mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
    <template v-for="(s, index) in steps" :key="s.num">
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
          :class="
            step >= s.num
              ? 'bg-[var(--color-primary)] text-white'
              : 'border border-[var(--color-border)] text-[var(--color-muted)]'
          "
        >
          {{ s.num }}
        </div>
        <span
          class="hidden text-sm sm:inline"
          :class="step >= s.num ? 'font-medium' : 'text-[var(--color-muted)]'"
        >
          {{ s.label }}
        </span>
      </div>
      <div
        v-if="index < steps.length - 1"
        class="h-px w-4 sm:w-8"
        :class="step > s.num ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'"
      />
    </template>
  </div>
</template>
