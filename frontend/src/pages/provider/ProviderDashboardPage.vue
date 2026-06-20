<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import {
  Calendar,
  Clock,
  CheckCircle,
  Briefcase,
  ClipboardList,
  Settings,
  Wrench,
} from "lucide-vue-next";
import { fetchProviderDashboardOverview } from "@/services/provider-dashboard.service";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard.vue";
import NetworkErrorState from "@/components/feedback/NetworkErrorState.vue";
import UiCard from "@/components/ui/UiCard.vue";
import { formatPersianNumber } from "@/utils/numbers";
import { WifiOff } from "lucide-vue-next";

const loading = ref(true);
const error = ref(false);
const overview = ref<Awaited<ReturnType<typeof fetchProviderDashboardOverview>> | null>(null);

const quickLinks = [
  { to: "/provider/schedule", label: "برنامه کاری", icon: Calendar },
  { to: "/provider/services", label: "خدمات من", icon: Wrench },
  { to: "/provider/appointments", label: "مدیریت نوبت‌ها", icon: ClipboardList },
  { to: "/profile", label: "پروفایل", icon: Settings },
];

async function load() {
  loading.value = true;
  error.value = false;
  try {
    overview.value = await fetchProviderDashboardOverview();
  } catch {
    error.value = true;
    overview.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="provider-dashboard-page">
    <h1 class="provider-dashboard-page__title">پنل ارائه‌دهنده</h1>

    <NetworkErrorState
      v-if="error"
      :icon="WifiOff"
      title="خطا در بارگذاری داشبورد"
      @retry="load"
    />

    <template v-else>
      <div class="provider-dashboard-page__stats">
        <DashboardStatCard
          label="نوبت‌های امروز"
          :value="loading ? '—' : formatPersianNumber(overview?.todayAppointments ?? 0)"
          :icon="Calendar"
          :loading="loading"
        />
        <DashboardStatCard
          label="در انتظار تأیید"
          :value="loading ? '—' : formatPersianNumber(overview?.pendingConfirmations ?? 0)"
          :icon="Clock"
          :loading="loading"
        />
        <DashboardStatCard
          label="انجام‌شده این ماه"
          :value="loading ? '—' : formatPersianNumber(overview?.completedThisMonth ?? 0)"
          :icon="CheckCircle"
          :loading="loading"
        />
        <DashboardStatCard
          label="درآمد این ماه"
          :value="loading ? '—' : `${formatPersianNumber(overview?.revenueThisMonth ?? 0)} تومان`"
          :icon="Briefcase"
          :loading="loading"
        />
      </div>

      <section class="provider-dashboard-page__links">
        <h2 class="heading-section">دسترسی سریع</h2>
        <div class="provider-dashboard-page__grid">
          <RouterLink v-for="link in quickLinks" :key="link.to" :to="link.to">
            <UiCard class="provider-dashboard-page__card">
              <component :is="link.icon" :size="22" />
              {{ link.label }}
            </UiCard>
          </RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.provider-dashboard-page__title {
  margin-bottom: var(--space-6);
  font-size: var(--text-2xl);
  font-weight: 700;
}

.provider-dashboard-page__stats {
  display: grid;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

@media (min-width: 640px) {
  .provider-dashboard-page__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .provider-dashboard-page__stats {
    grid-template-columns: repeat(4, 1fr);
  }
}

.provider-dashboard-page__links {
  margin-top: var(--space-6);
}

.provider-dashboard-page__grid {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

@media (min-width: 640px) {
  .provider-dashboard-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.provider-dashboard-page__card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: 500;
  transition: border-color var(--transition-base);
}

.provider-dashboard-page__card:hover {
  border-color: var(--color-primary);
}
</style>
