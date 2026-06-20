<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import {
  Users,
  Calendar,
  Briefcase,
  ClipboardList,
  Settings,
  FolderTree,
  Wrench,
  UserCheck,
  WifiOff,
} from "lucide-vue-next";
import {
  fetchAnalyticsOverview,
  fetchAnalyticsTrends,
  formatOverviewStats,
} from "@/services/analytics.service";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard.vue";
import ChartCard from "@/components/dashboard/ChartCard.vue";
import NetworkErrorState from "@/components/feedback/NetworkErrorState.vue";
import UiButton from "@/components/ui/UiButton.vue";
import SkeletonBase from "@/components/ui/skeleton/SkeletonBase.vue";

const loading = ref(true);
const error = ref(false);
const stats = ref<ReturnType<typeof formatOverviewStats>>([]);
const trendLabels = ref<string[]>([]);
const appointmentTrend = ref<number[]>([]);
const revenueTrend = ref<number[]>([]);

const quickLinks = [
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { to: "/admin/services", label: "خدمات", icon: Wrench },
  { to: "/admin/users", label: "کاربران", icon: Users },
  { to: "/admin/service-requests", label: "درخواست خدمت", icon: ClipboardList },
  { to: "/admin/provider-requests", label: "درخواست ارائه‌دهنده", icon: UserCheck },
  { to: "/admin/appointments", label: "نوبت‌ها", icon: Calendar },
  { to: "/admin/settings", label: "تنظیمات", icon: Settings },
];

const statIcons: Record<string, typeof Users> = {
  users: Users,
  calendar: Calendar,
  briefcase: Briefcase,
  star: Calendar,
};

async function load() {
  loading.value = true;
  error.value = false;
  try {
    const [overviewRes, trendsRes] = await Promise.all([
      fetchAnalyticsOverview(),
      fetchAnalyticsTrends(6),
    ]);
    stats.value = formatOverviewStats(overviewRes.data);
    trendLabels.value = trendsRes.data.labels;
    appointmentTrend.value = trendsRes.data.appointments;
    revenueTrend.value = trendsRes.data.revenue;
  } catch {
    error.value = true;
    stats.value = [];
    trendLabels.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="admin-dashboard">
    <div class="admin-dashboard__header">
      <h1 class="heading-page">پنل مدیریت</h1>
      <RouterLink to="/admin/settings">
        <UiButton variant="secondary">
          <Settings :size="18" />
          تنظیمات
        </UiButton>
      </RouterLink>
    </div>

    <NetworkErrorState
      v-if="error"
      :icon="WifiOff"
      title="خطا در بارگذاری آمار"
      description="اتصال به سرور برقرار نشد. آمار از پایگاه داده بارگذاری نشد."
      @retry="load"
    />

    <template v-else>
      <div v-if="loading" class="admin-dashboard__stats">
        <SkeletonBase v-for="i in 4" :key="i" height="6rem" />
      </div>
      <div v-else class="admin-dashboard__stats">
        <DashboardStatCard
          v-for="(stat, i) in stats.slice(0, 8)"
          :key="i"
          :label="stat.label"
          :value="stat.value"
          :icon="statIcons[stat.icon] ?? Calendar"
        />
      </div>

      <div v-if="!loading && trendLabels.length" class="admin-dashboard__charts">
        <ChartCard
          title="روند نوبت‌ها"
          :labels="trendLabels"
          :data="appointmentTrend"
          color="#006bff"
        />
        <ChartCard
          title="روند درآمد"
          :labels="trendLabels"
          :data="revenueTrend"
          color="#0d9488"
        />
      </div>

      <section class="admin-dashboard__links">
        <h2 class="heading-section">دسترسی سریع</h2>
        <div class="admin-dashboard__link-grid">
          <RouterLink v-for="link in quickLinks" :key="link.to" :to="link.to" class="admin-dashboard__link">
            <component :is="link.icon" :size="22" />
            {{ link.label }}
          </RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.admin-dashboard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.admin-dashboard__stats {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: var(--space-8);
}

@media (min-width: 768px) {
  .admin-dashboard__stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

.admin-dashboard__charts {
  display: grid;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

@media (min-width: 1024px) {
  .admin-dashboard__charts {
    grid-template-columns: repeat(2, 1fr);
  }
}

.admin-dashboard__links {
  margin-top: var(--space-4);
}

.admin-dashboard__link-grid {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

@media (min-width: 640px) {
  .admin-dashboard__link-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .admin-dashboard__link-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.admin-dashboard__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 500;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.admin-dashboard__link:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  color: var(--color-primary);
}
</style>
