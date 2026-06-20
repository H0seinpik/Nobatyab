<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { apiGet } from "@/services/api";
import { useSettingsStore } from "@/stores/settings";
import { formatPersianNumber } from "@/utils/numbers";
import HeroSection from "@/components/marketing/HeroSection.vue";
import StatsSection from "@/components/marketing/StatsSection.vue";
import ServiceCard from "@/components/discovery/ServiceCard.vue";
import ProviderCard from "@/components/discovery/ProviderCard.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import CategoryPill from "@/components/marketing/CategoryPill.vue";
import PageSection from "@/components/layout/PageSection.vue";
import { fetchPublicStats } from "@/services/public.service";
import { useHeroPreview } from "@/composables/useHeroPreview";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { services: number };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  defaultDuration: number;
  basePrice: string;
  category: { name: string };
}

interface Provider {
  id: string;
  bio: string | null;
  specialization: string | null;
  address: string | null;
  avgRating: number;
  reviewCount: number;
  user: { fullName: string; avatarUrl: string | null };
  providerServices: { service?: { name: string } }[];
}

const settings = useSettingsStore();
const categories = ref<Category[]>([]);
const featuredServices = ref<Service[]>([]);
const featuredProviders = ref<Provider[]>([]);
const platformStats = ref<Awaited<ReturnType<typeof fetchPublicStats>> | null>(null);
const loading = ref(true);

const heroProvider = computed(() => featuredProviders.value[0] ?? null);
const heroProviderId = computed(() => heroProvider.value?.id);

const {
  slots: heroSlots,
  previewDate,
  previewPrice,
  previewDuration,
  loading: heroPreviewLoading,
  formatDateLabel,
} = useHeroPreview(() => heroProviderId.value);
const heroServiceName = computed(() => {
  const p = heroProvider.value;
  if (!p?.providerServices?.length) return undefined;
  return p.providerServices[0]?.service?.name;
});

const siteTitle = computed(() => settings.get("site.title", "رزرو آنلاین نوبت"));
const siteDescription = computed(() =>
  settings.get("site.description", "خدمات مورد نظر خود را انتخاب کنید و نوبت بگیرید"),
);

const stats = computed(() => {
  const s = platformStats.value;
  if (!s) return [];
  return [
    { label: "دسته‌بندی", value: formatPersianNumber(s.categories), icon: "briefcase" as const },
    { label: "خدمات", value: formatPersianNumber(s.services), icon: "calendar" as const },
    { label: "ارائه‌دهندگان", value: formatPersianNumber(s.providers), icon: "users" as const },
    {
      label: "رزرو هوشمند",
      value: s.smartBookingEnabled ? "فعال" : "غیرفعال",
      icon: "star" as const,
    },
  ];
});

const heroDateLabel = computed(() => (previewDate.value ? formatDateLabel(previewDate.value) : undefined));
onMounted(async () => {
  try {
    await settings.fetchPublic();
    const [catRes, svcRes, provRes, statsRes] = await Promise.all([
      apiGet<Category[]>("/categories"),
      apiGet<Service[]>("/services", { limit: 6 }),
      apiGet<Provider[]>("/providers", { limit: 4 }),
      fetchPublicStats(),
    ]);
    categories.value = catRes.data;
    featuredServices.value = svcRes.data;
    featuredProviders.value = provRes.data;
    platformStats.value = statsRes;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="home-page">
    <HeroSection
      :title="siteTitle"
      :description="siteDescription"
      hint="با رزرو هوشمند، بهترین زمان را بر اساس دسترسی شما پیدا کنید"
      :preview-provider-name="heroProvider?.user.fullName"
      :preview-specialization="heroProvider?.specialization ?? undefined"
      :preview-service-name="heroServiceName"
      :preview-address="heroProvider?.address ?? undefined"
      :preview-rating="heroProvider?.avgRating"
      :preview-review-count="heroProvider?.reviewCount"
      :preview-slots="heroSlots"
      :preview-date-label="heroDateLabel"
      :preview-price="previewPrice"
      :preview-duration="previewDuration"
      :preview-loading="heroPreviewLoading"
    />

    <StatsSection :stats="stats" />

    <PageSection title="دسته‌بندی‌ها" view-all-to="/services">
      <div v-if="loading" class="grid-cards">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>
      <ContentFade v-else>
        <div class="grid-cards">
          <CategoryPill
            v-for="cat in categories"
            :key="cat.id"
            :to="`/services?categoryId=${cat.id}`"
            :name="cat.name"
            :description="cat.description"
            :service-count="cat._count?.services"
          />
        </div>
      </ContentFade>
    </PageSection>

    <PageSection v-if="featuredServices.length" title="خدمات پرطرفدار" view-all-to="/services">
      <div class="grid-cards">
        <ServiceCard
          v-for="svc in featuredServices"
          :key="svc.id"
          :id="svc.id"
          :name="svc.name"
          :description="svc.description"
          :category-name="svc.category.name"
          :base-price="Number(svc.basePrice)"
          :default-duration="svc.defaultDuration"
        />
      </div>
    </PageSection>

    <PageSection v-if="featuredProviders.length" title="ارائه‌دهندگان برتر" view-all-to="/providers">
      <div class="grid-cards">
        <ProviderCard
          v-for="p in featuredProviders"
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
        />
      </div>
    </PageSection>
  </div>
</template>

<style scoped>
</style>
