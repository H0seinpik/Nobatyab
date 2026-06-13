<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppShell from "@/components/layout/AppShell.vue";

const route = useRoute();
const auth = useAuthStore();
const sidebarOpen = ref(false);

const links = computed(() => {
  if (auth.user?.role === "ADMIN") {
    return [
      { to: "/admin", label: "داشبورد" },
      { to: "/admin/categories", label: "دسته‌بندی‌ها" },
      { to: "/admin/services", label: "خدمات" },
      { to: "/admin/users", label: "کاربران" },
      { to: "/admin/service-requests", label: "درخواست‌ها" },
      { to: "/admin/provider-requests", label: "درخواست ارائه‌دهنده" },
      { to: "/admin/appointments", label: "نوبت‌ها" },
      { to: "/admin/settings", label: "تنظیمات" },
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

function closeSidebar() {
  sidebarOpen.value = false;
}
</script>

<template>
  <AppShell :show-nav="false">
    <div class="flex flex-1">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        @click="closeSidebar"
      />

      <aside
        class="fixed inset-y-0 right-0 z-50 w-56 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-transform lg:static lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'"
      >
        <nav class="space-y-1">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="block rounded-lg px-3 py-2 text-sm transition"
            :class="
              route.path.startsWith(link.to)
                ? 'bg-[var(--color-primary)] text-white'
                : 'hover:bg-[var(--color-bg)]'
            "
            @click="closeSidebar"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
        <div class="mt-8">
          <RouterLink
            to="/profile"
            class="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-bg)]"
            @click="closeSidebar"
          >
            حساب کاربری
          </RouterLink>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex items-center border-b border-[var(--color-border)] px-4 py-3 lg:hidden">
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-bg)]"
            aria-label="منو"
            @click="sidebarOpen = !sidebarOpen"
          >
            ☰ منو
          </button>
        </div>
        <div class="flex-1 p-4 sm:p-6">
          <RouterView />
        </div>
      </div>
    </div>
  </AppShell>
</template>
