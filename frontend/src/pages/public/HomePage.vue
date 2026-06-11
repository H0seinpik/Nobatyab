<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { apiGet } from "@/services/api";
import { useSettingsStore } from "@/stores/settings";
import UiCard from "@/components/ui/UiCard.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

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
  <div>
    <section class="mb-10 text-center">
      <h1 class="mb-3 text-3xl font-bold">{{ siteTitle }}</h1>
      <p class="text-[var(--color-muted)]">{{ siteDescription }}</p>
    </section>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>

    <ContentFade v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink v-for="cat in categories" :key="cat.id" :to="`/services?categoryId=${cat.id}`">
          <UiCard class="h-full transition hover:border-[var(--color-primary)]">
            <h2 class="mb-2 text-lg font-semibold">{{ cat.name }}</h2>
            <p class="text-sm text-[var(--color-muted)]">{{ cat.description }}</p>
            <p v-if="cat._count" class="mt-3 text-xs text-[var(--color-primary)]">
              {{ cat._count.services }} خدمت
            </p>
          </UiCard>
        </RouterLink>
      </div>
    </ContentFade>
  </div>
</template>
