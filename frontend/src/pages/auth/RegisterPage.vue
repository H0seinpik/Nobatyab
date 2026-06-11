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
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">ثبت‌نام</h1>
      <form class="space-y-4" @submit.prevent="submit">
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
        <p v-if="auth.error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30">
          {{ auth.error }}
        </p>
        <UiButton type="submit" :loading="submitting || auth.loading" :disabled="!isValid || submitting" class="w-full">
          ثبت‌نام
        </UiButton>
      </form>
      <div class="mt-4 text-center">
               <RouterLink to="/login" class="mt-4 block text-center text-sm text-[var(--color-primary)]">
        ورود
      </RouterLink>
      </div>
    </UiCard>
  </div>
</template>
