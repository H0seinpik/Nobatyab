<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { apiGet } from "@/services/api";
import { useSettingsStore } from "@/stores/settings";
import UiCard from "@/components/ui/UiCard.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import SmartBookingButton from "@/components/smart-booking/SmartBookingButton.vue";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { services: number };
}

const settings = useSettingsStore();
const categories = ref<Category[]>([]);
const loading = ref(true);

const siteTitle = computed(() => settings.get("site.title", "رزرو آنلاین نوبت"));
const siteDescription = computed(() =>
  settings.get("site.description", "خدمات مورد نظر خود را انتخاب کنید و نوبت بگیرید"),
);

onMounted(async () => {
  try {
    await settings.fetchPublic();
    const res = await apiGet<Category[]>("/categories");
    categories.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="home-page">
    <section class="home-page__hero">
      <h1 class="home-page__title">{{ siteTitle }}</h1>
      <p class="home-page__description">{{ siteDescription }}</p>
      <p class="home-page__hint">
        با رزرو هوشمند، بهترین زمان را بر اساس دسترسی شما پیدا کنید
      </p>
      <div class="home-page__cta">
        <SmartBookingButton size="large" />
      </div>
    </section>

    <div v-if="loading" class="home-page__grid">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>

    <ContentFade v-else>
      <div class="home-page__grid">
        <RouterLink v-for="cat in categories" :key="cat.id" :to="`/services?categoryId=${cat.id}`">
          <UiCard class="home-page__card">
            <h2 class="home-page__card-title">{{ cat.name }}</h2>
            <p class="home-page__card-description">{{ cat.description }}</p>
            <p v-if="cat._count" class="home-page__card-count">
              {{ cat._count.services }} خدمت
            </p>
          </UiCard>
        </RouterLink>
      </div>
    </ContentFade>
  </div>
</template>

<style scoped>
.home-page__hero {
  margin-bottom: 2.5rem;
  text-align: center;
}

.home-page__title {
  margin-bottom: 0.75rem;
  font-size: 1.875rem;
  font-weight: 700;
}

.home-page__description {
  margin-bottom: 0.5rem;
  color: var(--color-muted);
}

.home-page__hint {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.home-page__cta {
  display: flex;
  justify-content: center;
}

.home-page__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .home-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .home-page__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.home-page__card {
  height: 100%;
  transition: border-color 0.2s ease;
}

.home-page__card:hover {
  border-color: var(--color-primary);
}

.home-page__card-title {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.home-page__card-description {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.home-page__card-count {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-primary);
}
</style>
