<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { apiGet } from "@/services/api";
import FilterBar from "@/components/discovery/FilterBar.vue";
import ServiceCard from "@/components/discovery/ServiceCard.vue";
import EmptyState from "@/components/feedback/EmptyState.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { SearchX } from "lucide-vue-next";

interface Category {
  id: string;
  name: string;
}

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
const categories = ref<Category[]>([]);
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

onMounted(async () => {
  const catRes = await apiGet<Category[]>("/categories");
  categories.value = catRes.data;
  await load();
});

watch([search, categoryId], load);
</script>

<template>
  <div class="services-page">
    <h1 class="heading-page">خدمات</h1>
    <FilterBar
      v-model:search="search"
      v-model:category-id="categoryId"
      :categories="categories"
      search-placeholder="جستجوی نام خدمت..."
      @submit="load"
    />

    <div v-if="loading" class="grid-cards">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    <ContentFade v-else-if="services.length">
      <div class="grid-cards">
        <ServiceCard
          v-for="svc in services"
          :key="svc.id"
          :id="svc.id"
          :name="svc.name"
          :description="svc.description"
          :category-name="svc.category.name"
          :base-price="Number(svc.basePrice)"
          :default-duration="svc.defaultDuration"
        />
      </div>
    </ContentFade>
    <EmptyState
      v-else
      :icon="SearchX"
      title="خدمتی یافت نشد"
      description="فیلترها را تغییر دهید یا عبارت جستجوی دیگری امتحان کنید."
    />
  </div>
</template>

<style scoped>
.services-page {
  padding-block: var(--space-6);
}
</style>
