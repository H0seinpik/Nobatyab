<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/composables/useLogout";
import { useZodForm } from "@/composables/useZodForm";
import { changePasswordFormSchema } from "@/schemas/profile.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";

const auth = useAuthStore();
const logout = useLogout();

const successMessage = ref("");
const errorMessage = ref("");

const {
  values,
  fieldError,
  touch,
  isValid,
  submitting,
  validateAll,
  reset,
} = useZodForm(changePasswordFormSchema, {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

async function changePassword() {
  successMessage.value = "";
  errorMessage.value = "";
  if (!validateAll()) return;

  submitting.value = true;
  try {
    await auth.changePassword(values.currentPassword, values.newPassword);
    reset();
    successMessage.value = "رمز عبور تغییر کرد. لطفاً دوباره وارد شوید.";
    setTimeout(() => logout(), 1500);
  } catch {
    errorMessage.value = auth.error ?? "خطا در تغییر رمز عبور";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <UiCard>
    <h2 class="mb-4 font-semibold">تغییر رمز عبور</h2>
    <form class="space-y-4" @submit.prevent="changePassword">
      <UiInput
        v-model="values.currentPassword"
        label="رمز عبور فعلی"
        type="password"
        required
        :error="fieldError('currentPassword')"
        @blur="touch('currentPassword')"
      />
      <UiInput
        v-model="values.newPassword"
        label="رمز عبور جدید"
        type="password"
        required
        :error="fieldError('newPassword')"
        @blur="touch('newPassword')"
      />
      <UiInput
        v-model="values.confirmPassword"
        label="تکرار رمز جدید"
        type="password"
        required
        :error="fieldError('confirmPassword')"
        @blur="touch('confirmPassword')"
      />
      <UiAlert v-if="successMessage" variant="success">{{ successMessage }}</UiAlert>
      <UiAlert v-if="errorMessage" variant="error">{{ errorMessage }}</UiAlert>
      <UiButton
        type="submit"
        variant="secondary"
        :loading="submitting"
        :disabled="!isValid || submitting"
      >
        تغییر رمز عبور
      </UiButton>
    </form>
  </UiCard>
</template>
