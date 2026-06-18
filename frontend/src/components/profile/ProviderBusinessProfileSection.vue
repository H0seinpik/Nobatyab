<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { useCrudForm } from "@/composables/useCrudForm";
import { providerProfileFormSchema } from "@/schemas/provider.schema";
import {
  getProviderProfile,
  mapProviderProfileToForm,
  updateProviderProfile,
  type ProviderProfile,
} from "@/services/provider.service";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiModal from "@/components/ui/UiModal.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import ProviderProfileForm from "@/components/forms/provider/ProviderProfileForm.vue";
import MapLocationPicker from "@/components/maps/MapLocationPicker.vue";

const summaryMapRef = ref<{ refreshSize: () => void } | null>(null);
const formMapRef = ref<{ refreshSize: () => void } | null>(null);

const loading = ref(true);
const profileSummary = ref<ProviderProfile | null>(null);
const successMessage = ref("");

const initialValues = {
  specialization: "",
  bio: "",
  address: "",
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  slotDurationMinutes: 30,
  isAcceptingBookings: true,
};

const {
  isOpen,
  formError,
  formLoading,
  values,
  fieldError,
  touch,
  submitting,
  openEdit,
  close,
  submit,
} = useCrudForm({
  schemas: { create: providerProfileFormSchema, update: providerProfileFormSchema },
  initialValues,
  fetchEdit: async () => mapProviderProfileToForm(await getProviderProfile()),
  update: async (_id, data) => {
    profileSummary.value = await updateProviderProfile({
      specialization: data.specialization || undefined,
      bio: data.bio || undefined,
      address: data.address || undefined,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      slotDurationMinutes: data.slotDurationMinutes,
      isAcceptingBookings: data.isAcceptingBookings,
    });
    successMessage.value = "اطلاعات ارائه‌دهنده ذخیره شد";
  },
});

async function load() {
  loading.value = true;
  try {
    profileSummary.value = await getProviderProfile();
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function openModal() {
  successMessage.value = "";
  await openEdit({ id: "provider-profile" });
}

watch(loading, async (isLoading) => {
  if (isLoading) return;
  await nextTick();
  window.setTimeout(() => summaryMapRef.value?.refreshSize(), 200);
});

watch([isOpen, formLoading], async ([open, loadingForm]) => {
  if (!open || loadingForm) return;
  await nextTick();
  window.setTimeout(() => formMapRef.value?.refreshSize(), 200);
});
</script>

<template>
  <UiCard>
    <div v-if="loading">
      <SkeletonForm :fields="6" />
    </div>
    <template v-else>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold">اطلاعات ارائه‌دهنده</h2>
        <UiButton type="button" variant="secondary" @click="openModal">ویرایش</UiButton>
      </div>

      <dl v-if="profileSummary" class="space-y-3 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-[var(--color-muted)]">تخصص</dt>
          <dd>{{ profileSummary.specialization ?? "—" }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-[var(--color-muted)]">بیوگرافی</dt>
          <dd class="text-left">{{ profileSummary.bio ?? "—" }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-[var(--color-muted)]">آدرس</dt>
          <dd class="text-left">{{ profileSummary.address ?? "—" }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-[var(--color-muted)]">مدت اسلات</dt>
          <dd>{{ profileSummary.slotDurationMinutes }} دقیقه</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-[var(--color-muted)]">پذیرش نوبت</dt>
          <dd>{{ profileSummary.isAcceptingBookings ? "فعال" : "غیرفعال" }}</dd>
        </div>
      </dl>

      <div v-if="profileSummary" class="mt-4">
        <p class="mb-2 text-sm text-[var(--color-muted)]">موقعیت روی نقشه</p>
        <MapLocationPicker
          ref="summaryMapRef"
          readonly
          height="12rem"
          :latitude="profileSummary.latitude"
          :longitude="profileSummary.longitude"
        />
      </div>

      <UiAlert v-if="successMessage" variant="success" class="mt-4">{{ successMessage }}</UiAlert>
    </template>

    <UiModal
      v-model:open="isOpen"
      title="ویرایش پروفایل ارائه‌دهنده"
      size="lg"
      :closable="!formLoading && !submitting"
    >
      <form @submit.prevent="submit">
        <CrudFormShell
          :loading="formLoading"
          :submitting="submitting"
          :error="formError"
          @submit="submit"
          @cancel="close"
        >
          <ProviderProfileForm
            ref="formMapRef"
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
          />
        </CrudFormShell>
      </form>
    </UiModal>
  </UiCard>
</template>
