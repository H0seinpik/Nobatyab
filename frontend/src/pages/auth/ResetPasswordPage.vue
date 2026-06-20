<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { resetPasswordFormSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const done = ref(false);

const { values, fieldError, touch, isValid, submitting, submitError, handleSubmit } = useZodForm(
  resetPasswordFormSchema,
  { password: "", confirmPassword: "" },
);

async function submit() {
  const token = route.query.token as string;
  if (!token) {
    submitError.value = "لینک بازیابی نامعتبر است";
    return;
  }
  await handleSubmit(async (data) => {
    await auth.resetPassword(token, data.password);
    done.value = true;
    setTimeout(() => router.push("/login"), 2000);
  });
}
</script>

<template>
  <AuthLayout title="تنظیم رمز جدید" subtitle="رمز عبور جدید خود را وارد کنید">
    <p v-if="done" class="auth-form__success" role="status">رمز با موفقیت تغییر کرد. در حال انتقال...</p>
    <form v-else class="auth-form" @submit.prevent="submit">
      <UiInput
        v-model="values.password"
        label="رمز عبور جدید"
        type="password"
        required
        autocomplete="new-password"
        :error="fieldError('password')"
        @blur="touch('password')"
      />
      <UiInput
        v-model="values.confirmPassword"
        label="تکرار رمز عبور"
        type="password"
        required
        autocomplete="new-password"
        :error="fieldError('confirmPassword')"
        @blur="touch('confirmPassword')"
      />
      <p v-if="submitError" class="auth-form__error" role="alert">{{ submitError }}</p>
      <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting" class="auth-form__submit">
        ذخیره
      </UiButton>
    </form>
  </AuthLayout>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-form__success {
  color: var(--color-alert-success-text);
  font-size: var(--text-sm);
}

.auth-form__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.auth-form__submit {
  width: 100%;
}
</style>
