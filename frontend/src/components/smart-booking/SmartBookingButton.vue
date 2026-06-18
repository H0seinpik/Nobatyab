<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import UiButton from "@/components/ui/UiButton.vue";
import LoginModal from "./LoginModal.vue";

withDefaults(
  defineProps<{
    size?: "default" | "large";
  }>(),
  { size: "default" },
);

const router = useRouter();
const auth = useAuthStore();
const loginOpen = ref(false);
const checking = ref(false);

async function goToWizard() {
  checking.value = true;
  try {
    await router.push("/smart-booking");
  } finally {
    checking.value = false;
  }
}

async function handleClick() {
  if (!auth.isAuthenticated && localStorage.getItem("accessToken")) {
    await auth.fetchMe();
  }
  if (!auth.isAuthenticated) {
    loginOpen.value = true;
    return;
  }
  await goToWizard();
}

async function onLoginSuccess() {
  await goToWizard();
}
</script>

<template>
  <div class="smart-booking-button">
    <UiButton
      class="smart-booking-button__trigger"
      :class="{ 'smart-booking-button__trigger--large': size === 'large' }"
      :loading="checking"
      @click="handleClick"
    >
      رزرو هوشمند
    </UiButton>
    <LoginModal v-model:open="loginOpen" @success="onLoginSuccess" />
  </div>
</template>

<style scoped>
.smart-booking-button__trigger--large {
  padding: 0.75rem 2rem;
  font-size: 1rem;
}
</style>
