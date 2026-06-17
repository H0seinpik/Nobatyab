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
  <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <RouterLink
      v-if="managementLink"
      :to="managementLink.to"
      class="text-sm hover:text-[var(--color-primary)]"
    >
      {{ managementLink.label }}
    </RouterLink>
  </div>
</template>
