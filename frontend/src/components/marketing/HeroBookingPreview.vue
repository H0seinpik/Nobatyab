<script setup lang="ts">
import { computed } from "vue";
import { Calendar, Clock, MapPin, Star } from "lucide-vue-next";
import { formatPersianNumber } from "@/utils/numbers";
import { formatTime } from "@/utils/datetime";
import Avatar from "@/components/ui/Avatar.vue";
import SkeletonBase from "@/components/ui/skeleton/SkeletonBase.vue";
import type { SlotDto } from "@/types/booking";

const props = defineProps<{
  providerName?: string;
  specialization?: string;
  serviceName?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  slots?: SlotDto[];
  dateLabel?: string;
  price?: number | null;
  duration?: number | null;
  loading?: boolean;
}>();

const displaySlots = computed(() => props.slots ?? []);
const selectedSlotIndex = computed(() => (displaySlots.value.length > 1 ? 1 : 0));
</script>

<template>
  <div class="hero-booking-preview">
    <div class="hero-booking-preview__glow hero-booking-preview__glow--1" />
    <div class="hero-booking-preview__glow hero-booking-preview__glow--2" />

    <div v-if="loading" class="hero-booking-preview__card">
      <SkeletonBase height="2.75rem" />
      <SkeletonBase height="1.5rem" />
      <SkeletonBase height="4rem" />
      <SkeletonBase height="6rem" />
    </div>

    <div v-else-if="providerName" class="hero-booking-preview__card">
      <div class="hero-booking-preview__header">
        <Avatar :name="providerName" size="sm" />
        <div>
          <p class="hero-booking-preview__name">{{ providerName }}</p>
          <p v-if="specialization" class="hero-booking-preview__spec">{{ specialization }}</p>
        </div>
        <div v-if="rating != null && rating > 0" class="hero-booking-preview__rating">
          <Star :size="14" fill="currentColor" />
          {{ formatPersianNumber(rating) }}
          <span v-if="reviewCount" class="hero-booking-preview__review-count">
            ({{ formatPersianNumber(reviewCount) }})
          </span>
        </div>
      </div>

      <div v-if="serviceName" class="hero-booking-preview__service">
        <Clock :size="15" />
        {{ serviceName }}
        <template v-if="duration"> · {{ formatPersianNumber(duration) }} دقیقه</template>
      </div>

      <div class="hero-booking-preview__meta">
        <span v-if="dateLabel" class="hero-booking-preview__date">
          <Calendar :size="15" />
          {{ dateLabel }}
        </span>
        <span v-if="address" class="hero-booking-preview__location">
          <MapPin :size="15" />
          {{ address }}
        </span>
      </div>

      <template v-if="displaySlots.length">
        <p class="hero-booking-preview__label">انتخاب زمان</p>
        <div class="hero-booking-preview__slots">
          <span
            v-for="(slot, index) in displaySlots"
            :key="slot.startAt"
            class="hero-booking-preview__slot"
            :class="{ 'hero-booking-preview__slot--selected': index === selectedSlotIndex }"
          >
            {{ formatTime(slot.startAt) }}
          </span>
        </div>
      </template>

      <div v-if="price != null" class="hero-booking-preview__footer">
        <span class="hero-booking-preview__price">{{ formatPersianNumber(price) }} تومان</span>
        <span class="hero-booking-preview__cta">ثبت نوبت</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-booking-preview {
  position: relative;
  min-height: 18rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-booking-preview__glow {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(60px);
  opacity: 0.35;
  pointer-events: none;
}

.hero-booking-preview__glow--1 {
  width: 14rem;
  height: 14rem;
  background: var(--color-primary);
  top: -1rem;
  right: 0;
}

.hero-booking-preview__glow--2 {
  width: 9rem;
  height: 9rem;
  background: var(--color-success);
  bottom: 0;
  left: 0;
}

.hero-booking-preview__card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 22rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.hero-booking-preview__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.hero-booking-preview__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.hero-booking-preview__name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
}

.hero-booking-preview__spec {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: 2px;
}

.hero-booking-preview__rating {
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: #f59e0b;
  flex-shrink: 0;
}

.hero-booking-preview__review-count {
  font-weight: 400;
  color: var(--color-muted);
  font-size: var(--text-xs);
}

.hero-booking-preview__service {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
}

.hero-booking-preview__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-booking-preview__date,
.hero-booking-preview__location {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.hero-booking-preview__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.hero-booking-preview__slots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.hero-booking-preview__slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.hero-booking-preview__slot--selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.hero-booking-preview__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.hero-booking-preview__price {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.hero-booking-preview__cta {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}
</style>
