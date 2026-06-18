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
  <nav class="main-nav">
    <RouterLink to="/services" class="main-nav__link">خدمات</RouterLink>
    <RouterLink to="/providers" class="main-nav__link">ارائه‌دهندگان</RouterLink>
    <button
      v-if="auth.isAuthenticated && auth.user?.role === 'USER'"
      type="button"
      class="main-nav__link main-nav__button"
      :disabled="navLoading"
      @click="onSmartBookingClick"
    >
      رزرو هوشمند
    </button>
    <RouterLink v-if="auth.isAuthenticated" to="/dashboard" class="main-nav__link">
      داشبورد
    </RouterLink>
    <RouterLink v-if="auth.isAuthenticated" to="/appointments" class="main-nav__link">
      نوبت‌های من
    </RouterLink>
    <RouterLink
      v-if="auth.user?.role === 'PROVIDER'"
      to="/provider"
      class="main-nav__link"
    >
      پنل ارائه‌دهنده
    </RouterLink>
    <RouterLink v-if="auth.user?.role === 'ADMIN'" to="/admin" class="main-nav__link">
      پنل مدیریت
    </RouterLink>
  </nav>
</template>

<style scoped>
.main-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.main-nav__link {
  color: inherit;
  text-decoration: none;
}

.main-nav__link:hover {
  color: var(--color-primary);
}

.main-nav__button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.main-nav__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
