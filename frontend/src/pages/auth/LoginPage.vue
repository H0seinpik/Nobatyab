<script setup lang="ts">
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { loginFormSchema } from "@/schemas/auth.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

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
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">ورود</h1>
      <form class="space-y-4" @submit.prevent="submit">
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
        <p v-if="auth.error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30">
          {{ auth.error }}
        </p>
        <UiButton type="submit" :loading="submitting || auth.loading" :disabled="!isValid || submitting" class="w-full">
          ورود
        </UiButton>
      </form>
      <RouterLink to="/register" class="mt-4 block text-center text-sm text-[var(--color-primary)]">
        ثبت‌نام
      </RouterLink>
      <RouterLink to="/forgot-password" class="mt-2 block text-center text-sm text-[var(--color-muted)]">
        فراموشی رمز عبور
      </RouterLink>
    </UiCard>
  </div>
</template>
