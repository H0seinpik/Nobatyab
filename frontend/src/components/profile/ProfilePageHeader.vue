<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

defineProps<{
  title: string;
}>();

const auth = useAuthStore();

const managementLink = computed(() => {
  if (auth.user?.role === "ADMIN") {
    return { to: "/admin", label: "پنل مدیریت" };
  }
  if (auth.user?.role === "PROVIDER") {
    return { to: "/provider", label: "پنل ارائه‌دهنده" };
  }
  return null;
});
</script>

<template>
  <div class="profile-page-header">
    <h1 class="profile-page-header__title">{{ title }}</h1>
    <RouterLink
      v-if="managementLink"
      :to="managementLink.to"
      class="profile-page-header__link"
    >
      {{ managementLink.label }}
    </RouterLink>
  </div>
</template>

<style scoped>
.profile-page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.profile-page-header__title {
  font-size: 1.5rem;
  font-weight: 700;
}

.profile-page-header__link {
  font-size: 0.875rem;
  color: var(--color-text);
  transition: color 0.2s ease;
}

.profile-page-header__link:hover {
  color: var(--color-primary);
}
</style>
