<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const email = ref("");
const sent = ref(false);

async function submit() {
  await auth.forgotPassword(email.value);
  sent.value = true;
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">بازیابی رمز عبور</h1>
      <p v-if="sent" class="text-sm text-green-600">در صورت وجود ایمیل، لینک بازیابی ارسال شد (لاگ سرور).</p>
      <form v-else class="space-y-4" @submit.prevent="submit">
        <UiInput v-model="email" label="ایمیل" type="email" required />
        <UiButton type="submit" class="w-full">ارسال لینک</UiButton>
      </form>
    </UiCard>
  </div>
</template>
