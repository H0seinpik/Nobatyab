<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSmartBookingNavigation } from "@/composables/useSmartBookingNavigation";

const auth = useAuthStore();
const { goToSmartBooking } = useSmartBookingNavigation();
const navLoading = ref(false);

async function onSmartBookingClick() {
  navLoading.value = true;
  try {
    await goToSmartBooking();
  } finally {
    navLoading.value = false;
  }
}
</script>

<template>
  <nav class="flex items-center gap-3 text-sm">
    <RouterLink to="/services" class="hover:text-[var(--color-primary)]">خدمات</RouterLink>
    <RouterLink to="/providers" class="hover:text-[var(--color-primary)]">ارائه‌دهندگان</RouterLink>
    <button
      v-if="auth.isAuthenticated && auth.user?.role === 'USER'"
      type="button"
      class="hover:text-[var(--color-primary)] disabled:opacity-50"
      :disabled="navLoading"
      @click="onSmartBookingClick"
    >
      رزرو هوشمند
    </button>
    <RouterLink v-if="auth.isAuthenticated" to="/dashboard" class="hover:text-[var(--color-primary)]">
      داشبورد
    </RouterLink>
    <RouterLink v-if="auth.isAuthenticated" to="/appointments" class="hover:text-[var(--color-primary)]">
      نوبت‌های من
    </RouterLink>
    <RouterLink
      v-if="auth.user?.role === 'PROVIDER'"
      to="/provider"
      class="hover:text-[var(--color-primary)]"
    >
      پنل ارائه‌دهنده
    </RouterLink>
    <RouterLink v-if="auth.user?.role === 'ADMIN'" to="/admin" class="hover:text-[var(--color-primary)]">
      پنل مدیریت
    </RouterLink>
  </nav>
</template>
