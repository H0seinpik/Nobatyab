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
  <div class="reset-password-page">
    <UiCard>
      <h1 class="reset-password-page__title">تنظیم رمز جدید</h1>
      <p v-if="done" class="reset-password-page__success">رمز با موفقیت تغییر کرد. در حال انتقال...</p>
      <form v-else class="reset-password-page__form" @submit.prevent="submit">
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
        <p v-if="submitError" class="reset-password-page__error">{{ submitError }}</p>
        <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting" class="reset-password-page__submit">
          ذخیره
        </UiButton>
      </form>
    </UiCard>
  </div>
</template>

<style scoped>
.reset-password-page {
  max-width: 28rem;
  margin-inline: auto;
}

.reset-password-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.reset-password-page__success {
  color: var(--color-alert-success-text);
}

.reset-password-page__form > * + * {
  margin-top: 1rem;
}

.reset-password-page__error {
  font-size: 0.875rem;
  color: var(--color-danger);
}

.reset-password-page__submit {
  width: 100%;
}
</style>
