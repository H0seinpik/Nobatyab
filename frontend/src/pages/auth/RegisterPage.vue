<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { registerFormSchema } from "@/schemas/auth.schema";
import UiCard from "@/components/ui/UiCard.vue";
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
  <div class="register-page">
    <UiCard>
      <h1 class="register-page__title">ثبت‌نام</h1>
      <form class="register-page__form" @submit.prevent="submit">
        <UiInput
          v-model="values.fullName"
          label="نام کامل"
          required
          :error="fieldError('fullName')"
          @blur="touch('fullName')"
        />
        <UiInput
          v-model="values.email"
          label="ایمیل"
          type="email"
          required
          :error="fieldError('email')"
          @blur="touch('email')"
        />
        <UiInput
          v-model="values.phone"
          label="موبایل"
          :error="fieldError('phone')"
          @blur="touch('phone')"
        />
        <UiInput
          v-model="values.password"
          label="رمز عبور"
          type="password"
          required
          :error="fieldError('password')"
          @blur="touch('password')"
        />
        <p v-if="auth.error" class="register-page__error">
          {{ auth.error }}
        </p>
        <UiButton type="submit" :loading="submitting || auth.loading" :disabled="!isValid || submitting" class="register-page__submit">
          ثبت‌نام
        </UiButton>
      </form>
      <div class="register-page__footer">
        <RouterLink to="/login" class="register-page__link">
          ورود
        </RouterLink>
      </div>
    </UiCard>
  </div>
</template>

<style scoped>
.register-page {
  max-width: 28rem;
  margin-inline: auto;
}

.register-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.register-page__form > * + * {
  margin-top: 1rem;
}

.register-page__error {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: var(--color-alert-error-bg);
  color: var(--color-alert-error-text);
}

.register-page__submit {
  width: 100%;
}

.register-page__footer {
  margin-top: 1rem;
  text-align: center;
}

.register-page__link {
  display: block;
  font-size: 0.875rem;
  color: var(--color-primary);
}
</style>
