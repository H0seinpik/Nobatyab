<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const router = useRouter();

const fullName = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");

async function submit() {
  await auth.register({ fullName: fullName.value, email: email.value, phone: phone.value, password: password.value });
  router.push("/");
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">ثبت‌نام</h1>
      <form class="space-y-4" @submit.prevent="submit">
        <UiInput v-model="fullName" label="نام کامل" required />
        <UiInput v-model="email" label="ایمیل" type="email" required />
        <UiInput v-model="phone" label="موبایل" />
        <UiInput v-model="password" label="رمز عبور" type="password" required />
        <p v-if="auth.error" class="text-sm text-red-600">{{ auth.error }}</p>
        <UiButton type="submit" :loading="auth.loading" class="w-full">ثبت‌نام</UiButton>
      </form>
    </UiCard>
  </div>
</template>
