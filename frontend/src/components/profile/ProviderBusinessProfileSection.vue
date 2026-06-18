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
      <div class="provider-profile__header">
        <h2 class="provider-profile__title">اطلاعات ارائه‌دهنده</h2>
        <UiButton type="button" variant="secondary" @click="openModal">ویرایش</UiButton>
      </div>

      <dl v-if="profileSummary" class="provider-profile__details">
        <div class="provider-profile__row">
          <dt class="provider-profile__term">تخصص</dt>
          <dd>{{ profileSummary.specialization ?? "—" }}</dd>
        </div>
        <div class="provider-profile__row">
          <dt class="provider-profile__term">بیوگرافی</dt>
          <dd class="provider-profile__value--left">{{ profileSummary.bio ?? "—" }}</dd>
        </div>
        <div class="provider-profile__row">
          <dt class="provider-profile__term">آدرس</dt>
          <dd class="provider-profile__value--left">{{ profileSummary.address ?? "—" }}</dd>
        </div>
        <div class="provider-profile__row">
          <dt class="provider-profile__term">مدت اسلات</dt>
          <dd>{{ profileSummary.slotDurationMinutes }} دقیقه</dd>
        </div>
        <div class="provider-profile__row">
          <dt class="provider-profile__term">پذیرش نوبت</dt>
          <dd>{{ profileSummary.isAcceptingBookings ? "فعال" : "غیرفعال" }}</dd>
        </div>
      </dl>

      <div v-if="profileSummary" class="provider-profile__map">
        <p class="provider-profile__map-label">موقعیت روی نقشه</p>
        <MapLocationPicker
          ref="summaryMapRef"
          readonly
          height="12rem"
          :latitude="profileSummary.latitude"
          :longitude="profileSummary.longitude"
        />
      </div>

      <UiAlert v-if="successMessage" variant="success" class="provider-profile__alert">{{ successMessage }}</UiAlert>
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

<style scoped>
.provider-profile__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.provider-profile__title {
  font-weight: 600;
}

.provider-profile__details {
  font-size: 0.875rem;
}

.provider-profile__details > * + * {
  margin-top: 0.75rem;
}

.provider-profile__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.provider-profile__term {
  color: var(--color-muted);
}

.provider-profile__value--left {
  text-align: left;
}

.provider-profile__map {
  margin-top: 1rem;
}

.provider-profile__map-label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.provider-profile__alert {
  margin-top: 1rem;
}
</style>
