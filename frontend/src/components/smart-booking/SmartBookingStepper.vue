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
  <div class="smart-booking-stepper">
    <template v-for="(s, index) in steps" :key="s.num">
      <div class="smart-booking-stepper__step">
        <div
          class="smart-booking-stepper__indicator"
          :class="
            step >= s.num
              ? 'smart-booking-stepper__indicator--active'
              : 'smart-booking-stepper__indicator--inactive'
          "
        >
          {{ s.num }}
        </div>
        <span
          class="smart-booking-stepper__label"
          :class="
            step >= s.num
              ? 'smart-booking-stepper__label--active'
              : 'smart-booking-stepper__label--inactive'
          "
        >
          {{ s.label }}
        </span>
      </div>
      <div
        v-if="index < steps.length - 1"
        class="smart-booking-stepper__connector"
        :class="
          step > s.num
            ? 'smart-booking-stepper__connector--active'
            : 'smart-booking-stepper__connector--inactive'
        "
      />
    </template>
  </div>
</template>

<style scoped>
.smart-booking-stepper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .smart-booking-stepper {
    gap: 0.75rem;
  }
}

.smart-booking-stepper__step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.smart-booking-stepper__indicator {
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.smart-booking-stepper__indicator--active {
  background-color: var(--color-primary);
  color: #ffffff;
}

.smart-booking-stepper__indicator--inactive {
  border: 1px solid var(--color-border);
  color: var(--color-muted);
}

.smart-booking-stepper__label {
  display: none;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .smart-booking-stepper__label {
    display: inline;
  }
}

.smart-booking-stepper__label--active {
  font-weight: 500;
}

.smart-booking-stepper__label--inactive {
  color: var(--color-muted);
}

.smart-booking-stepper__connector {
  height: 1px;
  width: 1rem;
}

@media (min-width: 640px) {
  .smart-booking-stepper__connector {
    width: 2rem;
  }
}

.smart-booking-stepper__connector--active {
  background-color: var(--color-primary);
}

.smart-booking-stepper__connector--inactive {
  background-color: var(--color-border);
}
</style>
