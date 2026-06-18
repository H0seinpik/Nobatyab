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
  <div class="providers-page">
    <h1 class="providers-page__title">ارائه‌دهندگان</h1>
    <div v-if="loading" class="providers-page__grid">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    <ContentFade v-else>
      <div class="providers-page__grid">
        <RouterLink v-for="p in providers" :key="p.id" :to="`/providers/${p.id}`">
          <UiCard class="providers-page__card">
            <h2 class="providers-page__card-title">{{ p.user.fullName }}</h2>
            <p class="providers-page__card-bio">{{ p.bio }}</p>
            <p v-if="p.providerServices.length" class="providers-page__card-count">
              {{ p.providerServices.length }} خدمت فعال
            </p>
          </UiCard>
        </RouterLink>
      </div>
    </ContentFade>
  </div>
</template>

<style scoped>
.providers-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.providers-page__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .providers-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.providers-page__card {
  transition: border-color 0.2s ease;
}

.providers-page__card:hover {
  border-color: var(--color-primary);
}

.providers-page__card-title {
  font-weight: 600;
}

.providers-page__card-bio {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.providers-page__card-count {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-primary);
}
</style>
