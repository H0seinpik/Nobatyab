<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { apiGet } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";

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
  <div>
    <h1 class="mb-6 text-2xl font-bold">خدمات</h1>
    <div class="mb-6 grid gap-4 sm:grid-cols-2">
      <UiInput v-model="search" label="جستجو" placeholder="نام خدمت..." />
      <UiInput v-model="categoryId" label="شناسه دسته (اختیاری)" placeholder="categoryId" />
    </div>

    <p v-if="loading" class="text-[var(--color-muted)]">در حال بارگذاری...</p>
    <div v-else class="grid gap-4 sm:grid-cols-2">
      <UiCard v-for="svc in services" :key="svc.id">
        <h2 class="font-semibold">{{ svc.name }}</h2>
        <p class="mt-1 text-sm text-[var(--color-muted)]">{{ svc.category.name }}</p>
        <p class="mt-2 text-sm">{{ svc.description }}</p>
        <p class="mt-2 text-sm">{{ Number(svc.basePrice).toLocaleString("fa-IR") }} تومان · {{ svc.defaultDuration }} دقیقه</p>
        <RouterLink :to="`/providers?serviceId=${svc.id}`" class="mt-3 inline-block text-sm text-[var(--color-primary)]">
          مشاهده ارائه‌دهندگان ←
        </RouterLink>
      </UiCard>
    </div>
  </div>
</template>
