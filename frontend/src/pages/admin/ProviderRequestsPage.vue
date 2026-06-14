<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  listProviderRequests,
  type ProviderRequest,
} from "@/services/providerRequest.service";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiCard from "@/components/ui/UiCard.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { formatJalaliDateTime } from "@/utils/datetime";

const requests = ref<ProviderRequest[]>([]);
const loading = ref(true);
const error = ref("");

async function load() {
  loading.value = true;
  error.value = "";
  try {
    requests.value = await listProviderRequests("PENDING");
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
        ?.message ?? "";
    error.value = msg || "بارگذاری درخواست‌ها ناموفق بود.";
    requests.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <PageHeader
      title="درخواست‌های ارائه‌دهنده"
      description="کاربرانی که درخواست فعالیت به عنوان ارائه‌دهنده داده‌اند"
    />

    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <ContentFade v-else-if="error">
      <UiAlert variant="error">{{ error }}</UiAlert>
    </ContentFade>

    <ContentFade v-else-if="!requests.length">
      <UiCard class="text-center text-[var(--color-muted)]">
        درخواست در انتظاری وجود ندارد
      </UiCard>
    </ContentFade>

    <ContentFade v-else>
      <div class="space-y-3">
        <UiCard v-for="request in requests" :key="request.id">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold">{{ request.user?.fullName ?? "کاربر" }}</h2>
              <p class="text-sm text-[var(--color-muted)]">{{ request.user?.email }}</p>
              <p v-if="request.user?.phone" class="text-sm text-[var(--color-muted)]">
                {{ request.user.phone }}
              </p>
              <p v-if="request.note" class="mt-2 text-sm">{{ request.note }}</p>
              <p class="mt-2 text-xs text-[var(--color-muted)]">
                {{ formatJalaliDateTime(request.createdAt) }}
              </p>
            </div>
            <UiBadge>{{ request.status }}</UiBadge>
          </div>
        </UiCard>
      </div>
    </ContentFade>
  </div>
</template>
