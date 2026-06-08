<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");

async function submit() {
  const user = await auth.login(email.value, password.value);
  const redirect = (route.query.redirect as string) || "/";
  if (user.role === "ADMIN") router.push("/admin");
  else if (user.role === "PROVIDER") router.push("/provider");
  else router.push(redirect);
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">ورود</h1>
      <form class="space-y-4" @submit.prevent="submit">
        <UiInput v-model="email" label="ایمیل" type="email" required />
        <UiInput v-model="password" label="رمز عبور" type="password" required />
        <p v-if="auth.error" class="text-sm text-red-600">{{ auth.error }}</p>
        <UiButton type="submit" :loading="auth.loading" class="w-full">ورود</UiButton>
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
