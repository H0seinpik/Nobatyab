<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { forgotPasswordFormSchema } from "@/schemas/auth.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const sent = ref(false);

const { values, fieldError, touch, isValid, submitting, handleSubmit } = useZodForm(
  forgotPasswordFormSchema,
  { email: "" },
);

async function submit() {
  await handleSubmit(async (data) => {
    await auth.forgotPassword(data.email);
    sent.value = true;
  });
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">بازیابی رمز عبور</h1>
      <p v-if="sent" class="text-sm text-green-600">
        در صورت وجود ایمیل، لینک بازیابی ارسال شد.
      </p>
      <form v-else class="space-y-4" @submit.prevent="submit">
        <UiInput
          v-model="values.email"
          label="ایمیل"
          type="email"
          required
          :error="fieldError('email')"
          @blur="touch('email')"
        />
        <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting" class="w-full">
          ارسال لینک
        </UiButton>
      </form>
      <RouterLink to="/login" class="mt-4 block text-center text-sm text-[var(--color-primary)]">
        بازگشت به ورود
      </RouterLink>
    </UiCard>
  </div>
</template>
