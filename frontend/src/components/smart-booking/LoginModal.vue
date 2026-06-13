<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import UiModal from "@/components/ui/UiModal.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{ success: [] }>();

const auth = useAuthStore();
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);

async function handleLogin() {
  loading.value = true;
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    open.value = false;
    email.value = "";
    password.value = "";
    emit("success");
  } catch {
    error.value = auth.error ?? "ورود ناموفق بود";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UiModal v-model:open="open" title="ورود به حساب" size="sm">
    <form class="space-y-4" @submit.prevent="handleLogin">
      <p class="text-sm text-[var(--color-muted)]">
        برای استفاده از رزرو هوشمند، وارد حساب کاربری خود شوید.
      </p>
      <UiInput v-model="email" label="ایمیل" type="email" required />
      <UiInput v-model="password" label="رمز عبور" type="password" required />
      <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>
      <UiButton type="submit" class="w-full" :loading="loading">ورود</UiButton>
    </form>
  </UiModal>
</template>
