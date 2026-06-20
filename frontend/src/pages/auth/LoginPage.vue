<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { loginFormSchema } from "@/schemas/auth.schema";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const sessionMessage = computed(() => {
  const reason = route.query.reason as string | undefined;
  if (reason === "session-changed") {
    return "نقش یا وضعیت حساب شما تغییر کرده است. لطفاً دوباره وارد شوید.";
  }
  if (reason === "session-expired") {
    return "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.";
  }
  return null;
});

const { values, fieldError, touch, isValid, submitting, validateAll } = useZodForm(loginFormSchema, {
  email: "",
  password: "",
});

async function submit() {
  if (!validateAll()) return;
  submitting.value = true;
  auth.error = null;
  try {
    const user = await auth.login(values.email, values.password);
    const redirect = (route.query.redirect as string) || "/";
    if (user.role === "ADMIN") router.push("/admin");
    else if (user.role === "PROVIDER") router.push("/provider");
    else router.push(redirect);
  } catch {
    // auth.error is set in store
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AuthLayout title="ورود" subtitle="به حساب کاربری خود وارد شوید">
    <UiAlert v-if="sessionMessage" variant="info" class="auth-form__alert">{{ sessionMessage }}</UiAlert>
    <form class="auth-form" @submit.prevent="submit">
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
        v-model="values.password"
        label="رمز عبور"
        type="password"
        required
        autocomplete="current-password"
        :error="fieldError('password')"
        @blur="touch('password')"
      />
      <p v-if="auth.error" class="auth-form__error" role="alert">{{ auth.error }}</p>
      <UiButton type="submit" :loading="submitting || auth.loading" :disabled="!isValid || submitting" class="auth-form__submit">
        ورود
      </UiButton>
    </form>
    <nav class="auth-form__links" aria-label="لینک‌های مرتبط">
      <RouterLink to="/register">ثبت‌نام</RouterLink>
      <RouterLink to="/forgot-password">فراموشی رمز عبور</RouterLink>
    </nav>
  </AuthLayout>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.auth-form__alert {
  margin-bottom: var(--space-2);
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
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
}

.auth-form__links a {
  color: var(--color-primary);
}

.auth-form__links a:last-child {
  color: var(--color-muted);
}
</style>
