<script setup lang="ts">
defineProps<{
  step: number;
}>();

const steps = [
  { num: 1, label: "خدمت" },
  { num: 2, label: "زمان" },
  { num: 3, label: "تأیید" },
];
</script>

<template>
  <nav class="booking-step-header" aria-label="مراحل رزرو">
    <ol class="booking-step-header__list">
      <li
        v-for="s in steps"
        :key="s.num"
        class="booking-step-header__item"
        :class="{ 'booking-step-header__item--active': step >= s.num }"
        :aria-current="step === s.num ? 'step' : undefined"
      >
        <span class="booking-step-header__num">{{ s.num }}</span>
        <span class="booking-step-header__label">{{ s.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.booking-step-header__list {
  display: flex;
  gap: var(--space-4);
  list-style: none;
  margin: 0 0 var(--space-6);
  padding: 0;
  flex-wrap: wrap;
}

.booking-step-header__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.booking-step-header__item--active {
  color: var(--color-primary);
  font-weight: 600;
}

.booking-step-header__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-full);
  background: var(--color-border-subtle);
  font-size: var(--text-xs);
  font-weight: 700;
}

.booking-step-header__item--active .booking-step-header__num {
  background: var(--color-primary);
  color: #fff;
}
</style>
