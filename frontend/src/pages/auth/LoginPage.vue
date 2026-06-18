<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { loginFormSchema } from "@/schemas/auth.schema";
import UiCard from "@/components/ui/UiCard.vue";
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
  <div class="login-page">
    <UiCard>
      <h1 class="login-page__title">ورود</h1>
      <UiAlert v-if="sessionMessage" variant="info" class="login-page__alert">{{ sessionMessage }}</UiAlert>
      <form class="login-page__form" @submit.prevent="submit">
        <UiInput
          v-model="values.email"
          label="ایمیل"
          type="email"
          required
          :error="fieldError('email')"
          @blur="touch('email')"
        />
        <UiInput
          v-model="values.password"
          label="رمز عبور"
          type="password"
          required
          :error="fieldError('password')"
          @blur="touch('password')"
        />
        <p v-if="auth.error" class="login-page__error">
          {{ auth.error }}
        </p>
        <UiButton type="submit" :loading="submitting || auth.loading" :disabled="!isValid || submitting" class="login-page__submit">
          ورود
        </UiButton>
      </form>
      <RouterLink to="/register" class="login-page__link">
        ثبت‌نام
      </RouterLink>
      <RouterLink to="/forgot-password" class="login-page__link login-page__link--muted">
        فراموشی رمز عبور
      </RouterLink>
    </UiCard>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 28rem;
  margin-inline: auto;
}

.login-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.login-page__alert {
  margin-bottom: 1rem;
}

.login-page__form > * + * {
  margin-top: 1rem;
}

.login-page__error {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: var(--color-alert-error-bg);
  color: var(--color-alert-error-text);
}

.login-page__submit {
  width: 100%;
}

.login-page__link {
  display: block;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-primary);
}

.login-page__link--muted {
  margin-top: 0.5rem;
  color: var(--color-muted);
}
</style>
