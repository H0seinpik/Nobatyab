<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { apiGet } from "@/services/api";
import type { CatalogService } from "@/types/smartBooking";
import ServiceCard from "@/components/discovery/ServiceCard.vue";
import EmptyState from "@/components/feedback/EmptyState.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { SearchX } from "lucide-vue-next";

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
</script>

<template>
  <div class="service-selector">
    <div v-if="loading" class="service-selector__grid">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>

    <ContentFade v-else-if="bookableServices.length">
      <div class="service-selector__grid">
        <ServiceCard
          v-for="service in bookableServices"
          :key="service.id"
          :id="service.id"
          :name="service.name"
          :description="service.description"
          :category-name="service.category?.name"
          :base-price="Number(service.basePrice)"
          :default-duration="service.defaultDuration"
          selectable
          @select="emit('select', service)"
        />
      </div>
    </ContentFade>

    <EmptyState
      v-else
      :icon="SearchX"
      title="خدمتی برای رزرو هوشمند یافت نشد"
      description="خدمات با مدت زوج ۳۰ دقیقه‌ای برای رزرو هوشمند مناسب هستند."
    />
  </div>
</template>

<style scoped>
.service-selector__grid {
  display: grid;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .service-selector__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
