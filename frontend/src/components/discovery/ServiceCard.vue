<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Clock, Tag } from "lucide-vue-next";
import UiCard from "@/components/ui/UiCard.vue";
import { formatPriceDisplay } from "@/utils/numbers";

defineProps<{
  id: string;
  name: string;
  description?: string | null;
  categoryName?: string | null;
  basePrice?: number | null;
  defaultDuration?: number | null;
  to?: string;
  selectable?: boolean;
}>();

const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <component
    :is="selectable ? 'button' : RouterLink"
    :type="selectable ? 'button' : undefined"
    :to="selectable ? undefined : (to ?? `/providers?serviceId=${id}`)"
    class="service-card"
    @click="selectable ? emit('select') : undefined"
  >
    <UiCard class="service-card__inner">
      <div v-if="categoryName" class="service-card__category">
        <Tag :size="14" />
        {{ categoryName }}
      </div>
      <h3 class="service-card__title">{{ name }}</h3>
      <p v-if="description" class="service-card__description">{{ description }}</p>
      <div class="service-card__meta">
        <span v-if="basePrice != null" class="service-card__price">
          {{ formatPriceDisplay(basePrice) }} تومان
        </span>
        <span v-if="defaultDuration" class="service-card__duration">
          <Clock :size="14" />
          {{ defaultDuration }} دقیقه
        </span>
      </div>
    </UiCard>
  </component>
</template>

<style scoped>
.service-card {
  display: block;
  color: inherit;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  width: 100%;
  text-align: inherit;
  cursor: pointer;
  font: inherit;
}

.service-card__inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.service-card:hover .service-card__inner {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.service-card__category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-primary);
  background-color: var(--color-primary-subtle);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  width: fit-content;
}

.service-card__title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.service-card__description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.service-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-subtle);
}

.service-card__price {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.service-card__duration {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-muted);
}
</style>
