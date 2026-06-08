<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const password = ref("");
const done = ref(false);

async function submit() {
  const token = route.query.token as string;
  await auth.resetPassword(token, password.value);
  done.value = true;
  setTimeout(() => router.push("/login"), 2000);
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">تنظیم رمز جدید</h1>
      <p v-if="done" class="text-green-600">رمز با موفقیت تغییر کرد. در حال انتقال...</p>
      <form v-else class="space-y-4" @submit.prevent="submit">
        <UiInput v-model="password" label="رمز عبور جدید" type="password" required />
        <UiButton type="submit" class="w-full">ذخیره</UiButton>
      </form>
    </UiCard>
  </div>
</template>
