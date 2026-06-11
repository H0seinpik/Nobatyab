<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { apiGet } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

interface Provider {
  id: string;
  bio: string | null;
  user: { fullName: string; phone: string | null };
  providerServices: { service: { name: string }; price: string }[];
}

const route = useRoute();
const providers = ref<Provider[]>([]);
const loading = ref(true);
const serviceId = ref((route.query.serviceId as string) || "");

async function load() {
  loading.value = true;
  try {
    const res = await apiGet<Provider[]>("/providers", {
      serviceId: serviceId.value || undefined,
    });
    providers.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(serviceId, load);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">ارائه‌دهندگان</h1>
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    <ContentFade v-else>
    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink v-for="p in providers" :key="p.id" :to="`/providers/${p.id}`">
        <UiCard class="transition hover:border-[var(--color-primary)]">
          <h2 class="font-semibold">{{ p.user.fullName }}</h2>
          <p class="mt-1 text-sm text-[var(--color-muted)]">{{ p.bio }}</p>
          <p v-if="p.providerServices.length" class="mt-2 text-xs text-[var(--color-primary)]">
            {{ p.providerServices.length }} خدمت فعال
          </p>
        </UiCard>
      </RouterLink>
    </div>
    </ContentFade>
  </div>
</template>
