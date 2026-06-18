<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { apiGet } from "@/services/api";
import type { CatalogService } from "@/types/smartBooking";
import { formatPersianNumber } from "@/utils/numbers";
import UiCard from "@/components/ui/UiCard.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const emit = defineEmits<{ select: [service: CatalogService] }>();

const services = ref<CatalogService[]>([]);
const loading = ref(true);

const bookableServices = computed(() =>
  services.value.filter((s) => s.defaultDuration % 30 === 0),
);

onMounted(async () => {
  try {
    const res = await apiGet<CatalogService[]>("/services");
    services.value = res.data;
  } finally {
    loading.value = false;
  }
});

function formatPrice(price: string) {
  return formatPersianNumber(Number(price));
}
</script>

<template>
  <div class="service-selector">
    <div v-if="loading" class="service-selector__grid">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>

    <ContentFade v-else>
      <p v-if="!bookableServices.length" class="service-selector__empty">
        خدمتی برای رزرو هوشمند یافت نشد
      </p>
      <div v-else class="service-selector__grid">
        <button
          v-for="service in bookableServices"
          :key="service.id"
          type="button"
          class="service-selector__item"
          @click="emit('select', service)"
        >
          <UiCard>
            <h3 class="service-selector__name">{{ service.name }}</h3>
            <p v-if="service.description" class="service-selector__description">
              {{ service.description }}
            </p>
            <p class="service-selector__duration">
              <span class="service-selector__label">مدت:</span>
              {{ service.defaultDuration }} دقیقه
            </p>
            <p class="service-selector__price">
              از {{ formatPrice(service.basePrice) }} تومان
            </p>
          </UiCard>
        </button>
      </div>
    </ContentFade>
  </div>
</template>

<style scoped>
.service-selector__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .service-selector__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.service-selector__empty {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.service-selector__item {
  text-align: right;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 100%;
}

.service-selector__item :deep(.card) {
  height: 100%;
  transition: border-color 0.2s ease;
}

.service-selector__item:hover :deep(.card) {
  border-color: var(--color-primary);
}

.service-selector__name {
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.service-selector__description {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.service-selector__duration {
  font-size: 0.875rem;
}

.service-selector__label {
  color: var(--color-muted);
}

.service-selector__price {
  font-size: 0.875rem;
  color: var(--color-primary);
}
</style>
