<script setup lang="ts">
import { onMounted, ref } from "vue";
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

const auth = useAuthStore();
const logout = useLogout();
const pageLoading = ref(true);

const profileSuccess = ref("");
const profileError = ref("");
const passwordSuccess = ref("");
const passwordError = ref("");

const {
  values: profileValues,
  fieldError: profileFieldError,
  touch: profileTouch,
  isValid: profileValid,
  submitting: profileSubmitting,
  validateAll: validateProfile,
} = useZodForm(updateProfileFormSchema, { fullName: "", email: "" });

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
    }
  } finally {
    pageLoading.value = false;
  }
});

async function saveProfile() {
  profileSuccess.value = "";
  profileError.value = "";
  if (!validateProfile()) return;

  profileSubmitting.value = true;
  try {
    await auth.updateProfile({
      fullName: profileValues.fullName,
      email: profileValues.email,
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
