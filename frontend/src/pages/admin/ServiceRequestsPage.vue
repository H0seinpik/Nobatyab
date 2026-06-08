<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPatch } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";

interface Category {
  id: string;
  name: string;
}

interface ServiceRequest {
  id: string;
  status: string;
  serviceId: string | null;
  proposedName: string | null;
  proposedPrice: string | null;
  proposedDuration: number | null;
  provider: { user: { fullName: string } };
  service: { name: string } | null;
}

const requests = ref<ServiceRequest[]>([]);
const categories = ref<Category[]>([]);
const categoryByRequest = ref<Record<string, string>>({});
const error = ref("");

async function load() {
  const [reqRes, catRes] = await Promise.all([
    apiGet<ServiceRequest[]>("/admin/service-requests", { status: "PENDING" }),
    apiGet<Category[]>("/admin/categories"),
  ]);
  requests.value = reqRes.data;
  categories.value = catRes.data;
}

async function review(id: string, status: "APPROVED" | "REJECTED") {
  error.value = "";
  try {
    const body: { status: string; categoryId?: string } = { status };
    if (status === "APPROVED") {
      const req = requests.value.find((r) => r.id === id);
      if (req && !req.serviceId && !categoryByRequest.value[id]) {
        error.value = "برای تایید خدمت جدید، دسته‌بندی را انتخاب کنید";
        return;
      }
      if (categoryByRequest.value[id]) {
        body.categoryId = categoryByRequest.value[id];
      }
    }
    await apiPatch(`/admin/service-requests/${id}`, body);
    await load();
  } catch {
    error.value = "خطا در بررسی درخواست";
  }
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">درخواست‌های خدمت</h1>
    <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>
    <p v-if="!requests.length" class="text-[var(--color-muted)]">درخواست در انتظاری نیست</p>
    <div class="space-y-3">
      <UiCard v-for="r in requests" :key="r.id">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-semibold">{{ r.service?.name ?? r.proposedName }}</p>
            <p class="text-sm">{{ r.provider.user.fullName }}</p>
            <p v-if="!r.serviceId" class="mt-1 text-xs text-[var(--color-muted)]">
              خدمت جدید — قیمت: {{ r.proposedPrice }} — مدت: {{ r.proposedDuration }} دقیقه
            </p>
            <UiBadge class="mt-2">{{ r.status }}</UiBadge>
            <div v-if="!r.serviceId && categories.length" class="mt-3">
              <label class="text-xs text-[var(--color-muted)]">دسته‌بندی (برای تایید)</label>
              <select
                v-model="categoryByRequest[r.id]"
                class="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm"
              >
                <option value="">انتخاب کنید</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <div class="flex gap-2">
            <UiButton @click="review(r.id, 'APPROVED')">تایید</UiButton>
            <UiButton variant="danger" @click="review(r.id, 'REJECTED')">رد</UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
