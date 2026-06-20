<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { apiGet } from "@/services/api";
import { getUserProfile } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth";
import FilterBar from "@/components/discovery/FilterBar.vue";
import SortSelect from "@/components/discovery/SortSelect.vue";
import ProviderCard from "@/components/discovery/ProviderCard.vue";
import EmptyState from "@/components/feedback/EmptyState.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { Users } from "lucide-vue-next";

interface Provider {
  id: string;
  bio: string | null;
  specialization: string | null;
  address: string | null;
  avgRating: number;
  reviewCount: number;
  distanceKm?: number | null;
  user: { fullName: string; avatarUrl: string | null };
  providerServices: unknown[];
}

const route = useRoute();
const auth = useAuthStore();
const providers = ref<Provider[]>([]);
const loading = ref(true);
const search = ref("");
const serviceId = ref((route.query.serviceId as string) || "");
const sortBy = ref("rating");
const userLat = ref<number | undefined>();
const userLng = ref<number | undefined>();

async function resolveUserLocation() {
  if (auth.isAuthenticated) {
    try {
      const profile = await getUserProfile() as { latitude?: number | null; longitude?: number | null };
      if (profile.latitude != null && profile.longitude != null) {
        userLat.value = profile.latitude;
        userLng.value = profile.longitude;
        return;
      }
    } catch {
      // fall through to geolocation
    }
  }

  if (navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      userLat.value = pos.coords.latitude;
      userLng.value = pos.coords.longitude;
    } catch {
      // user denied or unavailable
    }
  }
}

async function load() {
  loading.value = true;
  try {
    const params: Record<string, string | number | undefined> = {
      serviceId: serviceId.value || undefined,
      q: search.value || undefined,
    };
    if (sortBy.value === "distance" && userLat.value != null && userLng.value != null) {
      params.lat = userLat.value;
      params.lng = userLng.value;
    }

    const res = await apiGet<Provider[]>("/providers", params);
    let list = res.data;

    if (sortBy.value === "rating") {
      list = [...list].sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    } else if (sortBy.value === "name") {
      list = [...list].sort((a, b) => a.user.fullName.localeCompare(b.user.fullName, "fa"));
    }

    providers.value = list;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await resolveUserLocation();
  await load();
});

watch([search, serviceId, sortBy], load);
</script>

<template>
  <div class="providers-page">
    <h1 class="heading-page">ارائه‌دهندگان</h1>
    <div class="providers-page__toolbar">
      <FilterBar
        v-model:search="search"
        :show-category="false"
        search-placeholder="جستجوی نام یا تخصص..."
        class="providers-page__filter"
        @submit="load"
      />
      <SortSelect v-model="sortBy" />
    </div>

    <div v-if="loading" class="grid-cards">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    <ContentFade v-else-if="providers.length">
      <div class="grid-cards">
        <ProviderCard
          v-for="p in providers"
          :key="p.id"
          :id="p.id"
          :full-name="p.user.fullName"
          :bio="p.bio"
          :specialization="p.specialization"
          :address="p.address"
          :avatar-url="p.user.avatarUrl"
          :service-count="p.providerServices.length"
          :avg-rating="p.avgRating"
          :review-count="p.reviewCount"
          :distance-km="p.distanceKm"
        />
      </div>
    </ContentFade>
    <EmptyState
      v-else
      :icon="Users"
      title="ارائه‌دهنده‌ای یافت نشد"
      description="فیلترها را تغییر دهید یا بعداً مراجعه کنید."
    />
  </div>
</template>

<style scoped>
.providers-page__toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

@media (min-width: 768px) {
  .providers-page__toolbar {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .providers-page__filter {
    flex: 1;
  }
}
</style>
