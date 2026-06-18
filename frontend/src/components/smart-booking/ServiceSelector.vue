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
  <div>
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>

    <ContentFade v-else>
      <p v-if="!bookableServices.length" class="text-sm text-[var(--color-muted)]">
        خدمتی برای رزرو هوشمند یافت نشد
      </p>
      <div v-else class="grid gap-4 sm:grid-cols-2">
        <button
          v-for="service in bookableServices"
          :key="service.id"
          type="button"
          class="text-right"
          @click="emit('select', service)"
        >
          <UiCard class="h-full transition hover:border-[var(--color-primary)]">
            <h3 class="mb-1 font-semibold">{{ service.name }}</h3>
            <p v-if="service.description" class="mb-2 text-sm text-[var(--color-muted)]">
              {{ service.description }}
            </p>
            <p class="text-sm">
              <span class="text-[var(--color-muted)]">مدت:</span>
              {{ service.defaultDuration }} دقیقه
            </p>
            <p class="text-sm text-[var(--color-primary)]">
              از {{ formatPrice(service.basePrice) }} تومان
            </p>
          </UiCard>
        </button>
      </div>
    </ContentFade>
  </div>
</template>
