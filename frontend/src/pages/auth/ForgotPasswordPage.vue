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
  <div class="forgot-password-page">
    <UiCard>
      <h1 class="forgot-password-page__title">بازیابی رمز عبور</h1>
      <p v-if="sent" class="forgot-password-page__success">
        در صورت وجود ایمیل، لینک بازیابی ارسال شد.
      </p>
      <form v-else class="forgot-password-page__form" @submit.prevent="submit">
        <UiInput
          v-model="values.email"
          label="ایمیل"
          type="email"
          required
          :error="fieldError('email')"
          @blur="touch('email')"
        />
        <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting" class="forgot-password-page__submit">
          ارسال لینک
        </UiButton>
      </form>
      <RouterLink to="/login" class="forgot-password-page__link">
        بازگشت به ورود
      </RouterLink>
    </UiCard>
  </div>
</template>

<style scoped>
.forgot-password-page {
  max-width: 28rem;
  margin-inline: auto;
}

.forgot-password-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.forgot-password-page__success {
  font-size: 0.875rem;
  color: var(--color-alert-success-text);
}

.forgot-password-page__form > * + * {
  margin-top: 1rem;
}

.forgot-password-page__submit {
  width: 100%;
}

.forgot-password-page__link {
  display: block;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-primary);
}
</style>
