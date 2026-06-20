<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Calendar, Sparkles } from "lucide-vue-next";
import UiButton from "@/components/ui/UiButton.vue";
import SmartBookingButton from "@/components/smart-booking/SmartBookingButton.vue";
import HeroBookingPreview from "./HeroBookingPreview.vue";
import type { SlotDto } from "@/types/booking";

defineProps<{
  title: string;
  description?: string;
  hint?: string;
  previewProviderName?: string;
  previewSpecialization?: string;
  previewServiceName?: string;
  previewAddress?: string;
  previewRating?: number;
  previewReviewCount?: number;
  previewSlots?: SlotDto[];
  previewDateLabel?: string;
  previewPrice?: number | null;
  previewDuration?: number | null;
  previewLoading?: boolean;
}>();
</script>

<template>
  <section class="hero-section">
    <div class="hero-section__content">
      <div class="hero-section__badge">
        <Sparkles :size="16" />
        رزرو آنلاین سریع و آسان
      </div>
      <h1 class="hero-section__title">{{ title }}</h1>
      <p v-if="description" class="hero-section__description">{{ description }}</p>
      <p v-if="hint" class="hero-section__hint">{{ hint }}</p>
      <div class="hero-section__actions">
        <SmartBookingButton size="large" />
        <RouterLink to="/services">
          <UiButton variant="secondary">
            <Calendar :size="18" />
            مرور خدمات
          </UiButton>
        </RouterLink>
      </div>
    </div>
    <HeroBookingPreview
      class="hero-section__visual"
      :provider-name="previewProviderName"
      :specialization="previewSpecialization"
      :service-name="previewServiceName"
      :address="previewAddress"
      :rating="previewRating"
      :review-count="previewReviewCount"
      :slots="previewSlots"
      :date-label="previewDateLabel"
      :price="previewPrice"
      :duration="previewDuration"
      :loading="previewLoading"
    />
  </section>
</template>

<style scoped>
.hero-section {
  display: grid;
  gap: var(--space-8);
  padding-block: var(--space-10);
  align-items: center;
}

@media (min-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr 1fr;
    padding-block: var(--space-16);
  }
}

.hero-section__content {
  animation: hero-enter 0.5s ease forwards;
}

@media (prefers-reduced-motion: reduce) {
  .hero-section__content {
    animation: none;
  }
}

@keyframes hero-enter {
  from {
    opacity: 0;
    transform: translateY(1.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-section__visual {
  display: none;
}

@media (min-width: 768px) {
  .hero-section__visual {
    display: flex;
  }
}

.hero-section__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--space-4);
}

.hero-section__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  color: var(--color-text);
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .hero-section__title {
    font-size: var(--text-4xl);
  }
}

.hero-section__description {
  margin-top: var(--space-4);
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  max-width: 32rem;
}

.hero-section__hint {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.hero-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}
</style>
