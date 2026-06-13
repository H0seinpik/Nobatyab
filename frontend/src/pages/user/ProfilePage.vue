<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/composables/useLogout";
import { useZodForm } from "@/composables/useZodForm";
import { updateProfileFormSchema, changePasswordFormSchema } from "@/schemas/profile.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import AvatarUpload from "@/components/profile/AvatarUpload.vue";
import ThemeSettings from "@/components/profile/ThemeSettings.vue";
import {
  getMyProviderRequest,
  submitProviderRequest,
  type ProviderRequest,
} from "@/services/providerRequest.service";

const auth = useAuthStore();
const logout = useLogout();
const pageLoading = ref(true);

const profileSuccess = ref("");
const profileError = ref("");
const passwordSuccess = ref("");
const passwordError = ref("");

const providerRequest = ref<ProviderRequest | null>(null);
const providerRequestNote = ref("");
const providerRequestLoading = ref(false);
const providerRequestSubmitting = ref(false);
const providerRequestSuccess = ref("");
const providerRequestError = ref("");

const {
  values: profileValues,
  fieldError: profileFieldError,
  touch: profileTouch,
  isValid: profileValid,
  submitting: profileSubmitting,
  validateAll: validateProfile,
} = useZodForm(updateProfileFormSchema, { fullName: "", email: "", phone: "" });

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

onMounted(async () => {
  try {
    await auth.fetchMe();
    if (auth.user) {
      profileValues.fullName = auth.user.fullName;
      profileValues.email = auth.user.email;
      profileValues.phone = auth.user.phone ?? "";
    }
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
});

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
    const msg =
      (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
        ?.message ?? "";
    if (msg.toLowerCase().includes("pending")) {
      providerRequestError.value = "شما قبلاً یک درخواست در انتظار دارید.";
    } else if (msg.toLowerCase().includes("already a provider")) {
      providerRequestError.value = "شما در حال حاضر ارائه‌دهنده هستید.";
    } else {
      providerRequestError.value = "ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.";
    }
  } finally {
    providerRequestSubmitting.value = false;
  }
}

async function saveProfile() {
  profileSuccess.value = "";
  profileError.value = "";
  if (!validateProfile()) return;

  profileSubmitting.value = true;
  try {
    await auth.updateProfile({
      fullName: profileValues.fullName,
      email: profileValues.email,
      phone: profileValues.phone || undefined,
    });
    profileSuccess.value = "پروفایل با موفقیت به‌روزرسانی شد";
  } catch {
    profileError.value = auth.error ?? "خطا در به‌روزرسانی پروفایل";
  } finally {
    profileSubmitting.value = false;
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
      <SkeletonForm :fields="2" />
      <SkeletonForm :fields="3" />
    </div>

    <ContentFade v-else class="max-w-lg space-y-6">
      <UiCard>
        <h2 class="mb-4 font-semibold">تصویر پروفایل</h2>
        <AvatarUpload />
      </UiCard>

      <UiCard>
        <h2 class="mb-4 font-semibold">اطلاعات حساب</h2>
        <form class="space-y-4" @submit.prevent="saveProfile">
          <UiInput
            v-model="profileValues.fullName"
            label="نام کامل"
            required
            :error="profileFieldError('fullName')"
            @blur="profileTouch('fullName')"
          />
          <UiInput
            v-model="profileValues.email"
            label="ایمیل"
            type="email"
            required
            :error="profileFieldError('email')"
            @blur="profileTouch('email')"
          />
          <UiInput
            v-model="profileValues.phone"
            label="شماره تماس"
            type="tel"
            :error="profileFieldError('phone')"
            @blur="profileTouch('phone')"
          />
          <UiAlert v-if="profileSuccess" variant="success">{{ profileSuccess }}</UiAlert>
          <UiAlert v-if="profileError" variant="error">{{ profileError }}</UiAlert>
          <UiButton
            type="submit"
            :loading="profileSubmitting"
            :disabled="!profileValid || profileSubmitting"
          >
            ذخیره تغییرات
          </UiButton>
        </form>
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
  </div>
</template>
