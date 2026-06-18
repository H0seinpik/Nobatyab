<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useCrudForm } from "@/composables/useCrudForm";
import { updateProfileFormSchema } from "@/schemas/profile.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiModal from "@/components/ui/UiModal.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import UserProfileForm from "@/components/forms/user/UserProfileForm.vue";
import {
  getUserProfile,
  mapUserProfileToForm,
  updateUserProfile,
  type UserProfile,
} from "@/services/user.service";

const emit = defineEmits<{ updated: [profile: UserProfile] }>();

const auth = useAuthStore();
const loading = ref(true);
const profileSummary = ref<UserProfile | null>(null);
const successMessage = ref("");

const profileInitialValues = {
  firstName: "",
  lastName: "",
  nationalCode: "",
  age: undefined as number | undefined,
  phone: "",
  address: "",
  email: "",
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
  schemas: { create: updateProfileFormSchema, update: updateProfileFormSchema },
  initialValues: profileInitialValues,
  fetchEdit: async () => mapUserProfileToForm(await getUserProfile()),
  update: async (_id, data) => {
    const profile = await updateUserProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      nationalCode: data.nationalCode || undefined,
      age: data.age,
      phone: data.phone || undefined,
      address: data.address || undefined,
      email: data.email,
    });
    await auth.fetchMe();
    profileSummary.value = profile;
    successMessage.value = "پروفایل با موفقیت به‌روزرسانی شد";
    emit("updated", profile);
  },
});

async function load() {
  loading.value = true;
  try {
    profileSummary.value = await getUserProfile();
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function openModal() {
  successMessage.value = "";
  await openEdit({ id: "profile" });
}

defineExpose({ reload: load });
</script>

<template>
  <UiCard>
    <div v-if="loading">
      <SkeletonForm :fields="4" />
    </div>
    <template v-else>
      <div class="account-profile__header">
        <h2 class="account-profile__title">اطلاعات حساب</h2>
        <UiButton type="button" variant="secondary" @click="openModal">ویرایش پروفایل</UiButton>
      </div>

      <dl v-if="profileSummary" class="account-profile__details">
        <div class="account-profile__row">
          <dt class="account-profile__term">نام</dt>
          <dd>{{ profileSummary.firstName ?? "—" }}</dd>
        </div>
        <div class="account-profile__row">
          <dt class="account-profile__term">نام خانوادگی</dt>
          <dd>{{ profileSummary.lastName ?? "—" }}</dd>
        </div>
        <div class="account-profile__row">
          <dt class="account-profile__term">کد ملی</dt>
          <dd>{{ profileSummary.nationalCode ?? "—" }}</dd>
        </div>
        <div class="account-profile__row">
          <dt class="account-profile__term">سن</dt>
          <dd>{{ profileSummary.age ?? "—" }}</dd>
        </div>
        <div class="account-profile__row">
          <dt class="account-profile__term">ایمیل</dt>
          <dd>{{ profileSummary.email }}</dd>
        </div>
        <div class="account-profile__row">
          <dt class="account-profile__term">شماره تماس</dt>
          <dd>{{ profileSummary.phone ?? "—" }}</dd>
        </div>
        <div class="account-profile__row">
          <dt class="account-profile__term">آدرس</dt>
          <dd class="account-profile__value--left">{{ profileSummary.address ?? "—" }}</dd>
        </div>
      </dl>

      <UiAlert v-if="successMessage" variant="success" class="account-profile__alert">{{ successMessage }}</UiAlert>
    </template>

    <UiModal
      v-model:open="isOpen"
      title="ویرایش پروفایل"
      :closable="!formLoading && !submitting"
    >
      <form @submit.prevent="submit">
        <CrudFormShell
          :loading="formLoading"
          :submitting="submitting"
          :error="formError"
          submit-label="ذخیره"
          @submit="submit"
          @cancel="close"
        >
          <UserProfileForm
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
.account-profile__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.account-profile__title {
  font-weight: 600;
}

.account-profile__details {
  font-size: 0.875rem;
}

.account-profile__details > * + * {
  margin-top: 0.75rem;
}

.account-profile__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.account-profile__term {
  color: var(--color-muted);
}

.account-profile__value--left {
  text-align: left;
}

.account-profile__alert {
  margin-top: 1rem;
}
</style>
