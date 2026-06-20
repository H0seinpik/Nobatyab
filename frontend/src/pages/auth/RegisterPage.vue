<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { registerFormSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const router = useRouter();

const { values, fieldError, touch, isValid, submitting, validateAll } = useZodForm(registerFormSchema, {
  fullName: "",
  email: "",
  phone: "",
  password: "",
});

async function submit() {
  if (!validateAll()) return;
  submitting.value = true;
  auth.error = null;
  try {
    await auth.register({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone || undefined,
      password: values.password,
    });
    router.push("/");
  } catch {
    // auth.error is set in store
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AuthLayout title="ثبت‌نام" subtitle="حساب جدید بسازید و نوبت بگیرید">
    <form class="auth-form" @submit.prevent="submit">
      <UiInput
        v-model="values.fullName"
        label="نام کامل"
        required
        autocomplete="name"
        :error="fieldError('fullName')"
        @blur="touch('fullName')"
      />
      <UiInput
        v-model="values.email"
        label="ایمیل"
        type="email"
        required
        autocomplete="email"
        :error="fieldError('email')"
        @blur="touch('email')"
      />
      <UiInput
        v-model="values.phone"
        label="موبایل"
        autocomplete="tel"
        :error="fieldError('phone')"
        @blur="touch('phone')"
      />
      <UiInput
        v-model="values.password"
        label="رمز عبور"
        type="password"
        required
        autocomplete="new-password"
        :error="fieldError('password')"
        @blur="touch('password')"
      />
      <p v-if="auth.error" class="auth-form__error" role="alert">{{ auth.error }}</p>
      <UiButton type="submit" :loading="submitting || auth.loading" :disabled="!isValid || submitting" class="auth-form__submit">
        ثبت‌نام
      </UiButton>
    </form>
    <nav class="auth-form__links" aria-label="لینک‌های مرتبط">
      <RouterLink to="/login">ورود</RouterLink>
    </nav>
  </AuthLayout>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-form__error {
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  background-color: var(--color-alert-error-bg);
  color: var(--color-alert-error-text);
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
