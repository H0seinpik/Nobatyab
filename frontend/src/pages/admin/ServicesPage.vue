<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiDelete } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

interface Service {
  id: string;
  name: string;
  defaultDuration: number;
  basePrice: string;
  category: { name: string };
}

const services = ref<Service[]>([]);
const categoryId = ref("");
const name = ref("");
const defaultDuration = ref(30);
const basePrice = ref(0);

async function load() {
  const res = await apiGet<Service[]>("/admin/services");
  services.value = res.data;
}

async function create() {
  await apiPost("/admin/services", {
    categoryId: categoryId.value,
    name: name.value,
    defaultDuration: Number(defaultDuration.value),
    basePrice: Number(basePrice.value),
  });
  await load();
}

async function remove(id: string) {
  await apiDelete(`/admin/services/${id}`);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">خدمات</h1>
    <UiCard class="mb-6 grid max-w-2xl gap-3 sm:grid-cols-2">
      <UiInput v-model="categoryId" label="شناسه دسته" />
      <UiInput v-model="name" label="نام" />
      <UiInput v-model="defaultDuration" label="مدت (دقیقه)" type="number" />
      <UiInput v-model="basePrice" label="قیمت پایه" type="number" />
      <UiButton class="sm:col-span-2" @click="create">افزودن</UiButton>
    </UiCard>
    <div class="space-y-2">
      <UiCard v-for="svc in services" :key="svc.id" class="flex items-center justify-between">
        <div>
          <p class="font-semibold">{{ svc.name }}</p>
          <p class="text-sm text-[var(--color-muted)]">{{ svc.category.name }}</p>
        </div>
        <UiButton variant="danger" @click="remove(svc.id)">حذف</UiButton>
      </UiCard>
    </div>
  </div>
</template>
