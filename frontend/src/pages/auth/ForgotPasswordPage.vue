<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { forgotPasswordFormSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const sent = ref(false);

const { values, fieldError, touch, isValid, submitting, handleSubmit } = useZodForm(
  forgotPasswordFormSchema,
  { email: "" },
);

async function submit() {
  await handleSubmit(async (data) => {
    await auth.forgotPassword(data.email);
    sent.value = true;
  });
}
</script>

<template>
  <AuthLayout title="بازیابی رمز عبور" subtitle="لینک بازیابی به ایمیل شما ارسال می‌شود">
    <p v-if="sent" class="auth-form__success" role="status">
      در صورت وجود ایمیل، لینک بازیابی ارسال شد.
    </p>
    <form v-else class="auth-form" @submit.prevent="submit">
      <UiInput
        v-model="values.email"
        label="ایمیل"
        type="email"
        required
        autocomplete="email"
        :error="fieldError('email')"
        @blur="touch('email')"
      />
      <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting" class="auth-form__submit">
        ارسال لینک
      </UiButton>
    </form>
    <nav class="auth-form__links" aria-label="لینک‌های مرتبط">
      <RouterLink to="/login">بازگشت به ورود</RouterLink>
    </nav>
  </AuthLayout>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-form__success {
  font-size: var(--text-sm);
  color: var(--color-alert-success-text);
}

.auth-form__submit {
  width: 100%;
}

.auth-form__links {
  margin-top: var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
}

.auth-form__links a {
  color: var(--color-primary);
}
</style>
