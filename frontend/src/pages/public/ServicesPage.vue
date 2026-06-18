<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { apiGet } from "@/services/api";
import { formatPersianNumber } from "@/utils/numbers";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

interface Service {
  id: string;
  name: string;
  description: string | null;
  defaultDuration: number;
  basePrice: string;
  category: { name: string };
}

const route = useRoute();
const services = ref<Service[]>([]);
const loading = ref(true);
const search = ref("");
const categoryId = ref((route.query.categoryId as string) || "");

async function load() {
  loading.value = true;
  try {
    const res = await apiGet<Service[]>("/services", {
      q: search.value || undefined,
      categoryId: categoryId.value || undefined,
    });
    services.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch([search, categoryId], load);
</script>

<template>
  <div class="services-page">
    <h1 class="services-page__title">خدمات</h1>
    <div class="services-page__filters">
      <UiInput v-model="search" label="جستجو" placeholder="نام خدمت..." />
      <UiInput v-model="categoryId" label="شناسه دسته (اختیاری)" placeholder="categoryId" />
    </div>

    <div v-if="loading" class="services-page__grid">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    <ContentFade v-else>
      <div class="services-page__grid">
        <UiCard v-for="svc in services" :key="svc.id">
          <h2 class="services-page__item-title">{{ svc.name }}</h2>
          <p class="services-page__item-category">{{ svc.category.name }}</p>
          <p class="services-page__item-description">{{ svc.description }}</p>
          <p class="services-page__item-meta">
            {{ formatPersianNumber(Number(svc.basePrice)) }} تومان · {{ svc.defaultDuration }} دقیقه
          </p>
          <RouterLink :to="`/providers?serviceId=${svc.id}`" class="services-page__item-link">
            مشاهده ارائه‌دهندگان ←
          </RouterLink>
        </UiCard>
      </div>
    </ContentFade>
  </div>
</template>

<style scoped>
.services-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.services-page__filters {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .services-page__filters {
    grid-template-columns: repeat(2, 1fr);
  }
}

.services-page__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .services-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.services-page__item-title {
  font-weight: 600;
}

.services-page__item-category {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.services-page__item-description {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.services-page__item-meta {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.services-page__item-link {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-primary);
}
</style>
