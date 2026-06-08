<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTheme } from "@/composables/useTheme";
import UiButton from "@/components/ui/UiButton.vue";

const route = useRoute();
const auth = useAuthStore();
const { toggle } = useTheme();

const links = computed(() => {
  if (auth.user?.role === "ADMIN") {
    return [
      { to: "/admin", label: "داشبورد" },
      { to: "/admin/categories", label: "دسته‌بندی‌ها" },
      { to: "/admin/services", label: "خدمات" },
      { to: "/admin/users", label: "کاربران" },
      { to: "/admin/service-requests", label: "درخواست‌ها" },
      { to: "/admin/appointments", label: "نوبت‌ها" },
    ];
  }
  return [
    { to: "/provider", label: "داشبورد" },
    { to: "/provider/profile", label: "پروفایل" },
    { to: "/provider/schedule", label: "برنامه کاری" },
    { to: "/provider/appointments", label: "نوبت‌ها" },
    { to: "/provider/service-requests", label: "درخواست خدمات" },
  ];
});
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-56 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <RouterLink to="/" class="mb-6 block font-bold text-[var(--color-primary)]">نوبت‌یاب</RouterLink>
      <nav class="space-y-1">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="block rounded-lg px-3 py-2 text-sm transition"
          :class="route.path.startsWith(link.to) ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-bg)]'"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <div class="mt-8 space-y-2">
        <UiButton variant="ghost" class="w-full" @click="toggle">تغییر تم</UiButton>
        <UiButton variant="secondary" class="w-full" @click="auth.logout()">خروج</UiButton>
      </div>
    </aside>
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
