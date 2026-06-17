<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/composables/useLogout";
import { useCrudForm } from "@/composables/useCrudForm";
import { useZodForm } from "@/composables/useZodForm";
import { updateProfileFormSchema, changePasswordFormSchema } from "@/schemas/profile.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiModal from "@/components/ui/UiModal.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import UserProfileForm from "@/components/forms/user/UserProfileForm.vue";
import AvatarUpload from "@/components/profile/AvatarUpload.vue";
import ThemeSettings from "@/components/profile/ThemeSettings.vue";
import {
  getMyProviderRequest,
  submitProviderRequest,
  type ProviderRequest,
} from "@/services/providerRequest.service";
import {
  getUserProfile,
  mapUserProfileToForm,
  updateUserProfile,
  type UserProfile,
} from "@/services/user.service";

const auth = useAuthStore();
const logout = useLogout();
const pageLoading = ref(true);
const profileSummary = ref<UserProfile | null>(null);
const profileSuccess = ref("");

const passwordSuccess = ref("");
const passwordError = ref("");

const providerRequest = ref<ProviderRequest | null>(null);
const providerRequestNote = ref("");
const providerRequestLoading = ref(false);
const providerRequestSubmitting = ref(false);
const providerRequestSuccess = ref("");
const providerRequestError = ref("");

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
  isOpen: profileModalOpen,
  formError: profileFormError,
  formLoading: profileFormLoading,
  values: profileValues,
  fieldError: profileFieldError,
  touch: profileTouch,
  submitting: profileSubmitting,
  openEdit: openProfileEdit,
  close: closeProfileModal,
  submit: submitProfile,
} = useCrudForm({
  schemas: { create: updateProfileFormSchema, update: updateProfileFormSchema },
  initialValues: profileInitialValues,
  fetchEdit: async () => mapUserProfileToForm(await getUserProfile()),
  update: async (_id, data) => {
    await updateUserProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      nationalCode: data.nationalCode || undefined,
      age: data.age,
      phone: data.phone || undefined,
      address: data.address || undefined,
      email: data.email,
    });
    await auth.fetchMe();
    profileSummary.value = await getUserProfile();
    profileSuccess.value = "پروفایل با موفقیت به‌روزرسانی شد";
  },
});

const {
  values: passwordValues,
  fieldError: passwordFieldError,
  touch: passwordTouch,
  isValid: passwordValid,
  submitting: passwordSubmitting,
  validateAll: validatePassword,
  reset: resetPasswordForm,
} = useZodForm(changePasswordFormSchema, {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

async function loadPage() {
  try {
    profileSummary.value = await getUserProfile();
    await auth.fetchMe();
    if (auth.user?.role === "USER") {
      providerRequestLoading.value = true;
      try {
        providerRequest.value = await getMyProviderRequest();
      } finally {
        providerRequestLoading.value = false;
      }
    }
  } finally {
    pageLoading.value = false;
  }
}

onMounted(loadPage);

async function openProfileModal() {
  profileSuccess.value = "";
  await openProfileEdit({ id: "profile" });
}

async function submitProviderApplication() {
  providerRequestSuccess.value = "";
  providerRequestError.value = "";
  if (providerRequestSubmitting.value) return;

  providerRequestSubmitting.value = true;
  try {
    providerRequest.value = await submitProviderRequest(providerRequestNote.value.trim() || undefined);
    providerRequestNote.value = "";
    providerRequestSuccess.value = "درخواست شما با موفقیت ثبت شد و در انتظار بررسی است.";
  } catch (e: unknown) {
    const err = e as {
      response?: { status?: number; data?: { error?: { message?: string } } };
    };
    const msg = err.response?.data?.error?.message ?? "";
    const status = err.response?.status;
    if (msg.toLowerCase().includes("pending")) {
      providerRequestError.value = "شما قبلاً یک درخواست در انتظار دارید.";
    } else if (msg.toLowerCase().includes("already a provider")) {
      providerRequestError.value = "شما در حال حاضر ارائه‌دهنده هستید.";
    } else if (status === 403) {
      providerRequestError.value = "فقط کاربران عادی می‌توانند درخواست ارسال کنند.";
    } else if (status === 401) {
      providerRequestError.value = "لطفاً دوباره وارد حساب کاربری خود شوید.";
    } else if (msg) {
      providerRequestError.value = msg;
    } else {
      providerRequestError.value = "ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.";
    }
  } finally {
    providerRequestSubmitting.value = false;
  }
}

async function changePassword() {
  passwordSuccess.value = "";
  passwordError.value = "";
  if (!validatePassword()) return;

  passwordSubmitting.value = true;
  try {
    await auth.changePassword(passwordValues.currentPassword, passwordValues.newPassword);
    resetPasswordForm();
    passwordSuccess.value = "رمز عبور تغییر کرد. لطفاً دوباره وارد شوید.";
    setTimeout(() => logout(), 1500);
  } catch {
    passwordError.value = auth.error ?? "خطا در تغییر رمز عبور";
  } finally {
    passwordSubmitting.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">پروفایل کاربری</h1>

    <div v-if="pageLoading" class="max-w-lg space-y-6">
      <SkeletonForm :fields="7" />
      <SkeletonForm :fields="3" />
    </div>

    <ContentFade v-else class="max-w-lg space-y-6">
      <UiCard>
        <h2 class="mb-4 font-semibold">تصویر پروفایل</h2>
        <AvatarUpload />
      </UiCard>

      <UiCard>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-semibold">اطلاعات حساب</h2>
          <UiButton type="button" variant="secondary" @click="openProfileModal">ویرایش پروفایل</UiButton>
        </div>

        <dl v-if="profileSummary" class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-[var(--color-muted)]">نام</dt>
            <dd>{{ profileSummary.firstName ?? "—" }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[var(--color-muted)]">نام خانوادگی</dt>
            <dd>{{ profileSummary.lastName ?? "—" }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[var(--color-muted)]">کد ملی</dt>
            <dd>{{ profileSummary.nationalCode ?? "—" }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[var(--color-muted)]">سن</dt>
            <dd>{{ profileSummary.age ?? "—" }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[var(--color-muted)]">ایمیل</dt>
            <dd>{{ profileSummary.email }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[var(--color-muted)]">شماره تماس</dt>
            <dd>{{ profileSummary.phone ?? "—" }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[var(--color-muted)]">آدرس</dt>
            <dd class="text-left">{{ profileSummary.address ?? "—" }}</dd>
          </div>
        </dl>

        <UiAlert v-if="profileSuccess" variant="success" class="mt-4">{{ profileSuccess }}</UiAlert>
      </UiCard>

      <UiCard v-if="auth.user?.role === 'USER'">
        <h2 class="mb-2 font-semibold">درخواست ارائه‌دهنده شدن</h2>
        <p class="mb-4 text-sm text-[var(--color-muted)]">
          اگر می‌خواهید خدمات خود را در پلتفرم ارائه دهید، درخواست خود را ارسال کنید.
        </p>

        <div v-if="providerRequestLoading" class="text-sm text-[var(--color-muted)]">
          در حال بارگذاری وضعیت درخواست...
        </div>

        <template v-else-if="providerRequest?.status === 'PENDING'">
          <UiAlert variant="info">
            درخواست شما در انتظار بررسی است ({{ providerRequest.status }}).
          </UiAlert>
        </template>

        <template v-else-if="providerRequest?.status === 'APPROVED'">
          <UiAlert variant="success">درخواست شما تأیید شده است.</UiAlert>
        </template>

        <template v-else-if="providerRequest?.status === 'REJECTED'">
          <UiAlert variant="error" class="mb-4">
            درخواست قبلی رد شده است.
            <span v-if="providerRequest.adminNote"> — {{ providerRequest.adminNote }}</span>
          </UiAlert>
          <form class="space-y-3" @submit.prevent="submitProviderApplication">
            <UiInput v-model="providerRequestNote" label="توضیحات (اختیاری)" />
            <UiButton type="submit" :loading="providerRequestSubmitting" :disabled="providerRequestSubmitting">
              ارسال درخواست جدید
            </UiButton>
          </form>
        </template>

        <template v-else>
          <form class="space-y-3" @submit.prevent="submitProviderApplication">
            <UiInput v-model="providerRequestNote" label="توضیحات (اختیاری)" />
            <UiAlert v-if="providerRequestSuccess" variant="success">{{ providerRequestSuccess }}</UiAlert>
            <UiAlert v-if="providerRequestError" variant="error">{{ providerRequestError }}</UiAlert>
            <UiButton type="submit" :loading="providerRequestSubmitting" :disabled="providerRequestSubmitting">
              ارسال درخواست
            </UiButton>
          </form>
        </template>
      </UiCard>

      <UiCard v-if="auth.user?.role === 'USER'">
        <h2 class="mb-2 font-semibold">رزرو هوشمند</h2>
        <p class="mb-4 text-sm text-[var(--color-muted)]">
          زمان‌های آزاد هفتگی خود را برای پیشنهاد خودکار نوبت تنظیم کنید.
        </p>
        <RouterLink to="/availability">
          <UiButton variant="secondary" type="button">تنظیم زمان‌های آزاد</UiButton>
        </RouterLink>
      </UiCard>

      <UiCard>
        <h2 class="mb-4 font-semibold">تنظیمات ظاهر</h2>
        <ThemeSettings />
      </UiCard>

      <UiCard>
        <h2 class="mb-4 font-semibold">تغییر رمز عبور</h2>
        <form class="space-y-4" @submit.prevent="changePassword">
          <UiInput
            v-model="passwordValues.currentPassword"
            label="رمز عبور فعلی"
            type="password"
            required
            :error="passwordFieldError('currentPassword')"
            @blur="passwordTouch('currentPassword')"
          />
          <UiInput
            v-model="passwordValues.newPassword"
            label="رمز عبور جدید"
            type="password"
            required
            :error="passwordFieldError('newPassword')"
            @blur="passwordTouch('newPassword')"
          />
          <UiInput
            v-model="passwordValues.confirmPassword"
            label="تکرار رمز جدید"
            type="password"
            required
            :error="passwordFieldError('confirmPassword')"
            @blur="passwordTouch('confirmPassword')"
          />
          <UiAlert v-if="passwordSuccess" variant="success">{{ passwordSuccess }}</UiAlert>
          <UiAlert v-if="passwordError" variant="error">{{ passwordError }}</UiAlert>
          <UiButton
            type="submit"
            variant="secondary"
            :loading="passwordSubmitting"
            :disabled="!passwordValid || passwordSubmitting"
          >
            تغییر رمز عبور
          </UiButton>
        </form>
      </UiCard>
    </ContentFade>

    <UiModal
      v-model:open="profileModalOpen"
      title="ویرایش پروفایل"
      :closable="!profileFormLoading && !profileSubmitting"
    >
      <form @submit.prevent="submitProfile">
        <CrudFormShell
          :loading="profileFormLoading"
          :submitting="profileSubmitting"
          :error="profileFormError"
          submit-label="ذخیره"
          @submit="submitProfile"
          @cancel="closeProfileModal"
        >
          <UserProfileForm
            :values="profileValues"
            :field-error="(f) => profileFieldError(f as keyof typeof profileValues)"
            :touch="(f) => profileTouch(f as keyof typeof profileValues)"
          />
        </CrudFormShell>
      </form>
    </UiModal>
  </div>
</template>
