<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { resetPasswordFormSchema } from "@/schemas/auth.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const done = ref(false);

const { values, fieldError, touch, isValid, submitting, submitError, handleSubmit } = useZodForm(
  resetPasswordFormSchema,
  { password: "", confirmPassword: "" },
);

async function submit() {
  const token = route.query.token as string;
  if (!token) {
    submitError.value = "لینک بازیابی نامعتبر است";
    return;
  }
  await handleSubmit(async (data) => {
    await auth.resetPassword(token, data.password);
    done.value = true;
    setTimeout(() => router.push("/login"), 2000);
  });
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <UiCard>
      <h1 class="mb-6 text-xl font-bold">تنظیم رمز جدید</h1>
      <p v-if="done" class="text-green-600">رمز با موفقیت تغییر کرد. در حال انتقال...</p>
      <form v-else class="space-y-4" @submit.prevent="submit">
        <UiInput
          v-model="values.password"
          label="رمز عبور جدید"
          type="password"
          required
          :error="fieldError('password')"
          @blur="touch('password')"
        />
        <UiInput
          v-model="values.confirmPassword"
          label="تکرار رمز عبور"
          type="password"
          required
          :error="fieldError('confirmPassword')"
          @blur="touch('confirmPassword')"
        />
        <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
        <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting" class="w-full">
          ذخیره
        </UiButton>
      </form>
    </UiCard>
  </div>
</template>
