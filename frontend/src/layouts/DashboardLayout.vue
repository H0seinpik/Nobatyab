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
    { to: "/profile", label: "پروفایل" },
    { to: "/provider/schedule", label: "برنامه کاری" },
    { to: "/provider/services", label: "خدمات من" },
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
    <div class="dashboard-layout">
      <div
        v-if="sidebarOpen"
        class="dashboard-layout__overlay"
        @click="closeSidebar"
      />

      <aside
        class="dashboard-layout__sidebar"
        :class="{ 'dashboard-layout__sidebar--open': sidebarOpen }"
      >
        <nav class="dashboard-layout__nav">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="dashboard-layout__link"
            :class="{ 'dashboard-layout__link--active': route.path.startsWith(link.to) }"
            @click="closeSidebar"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
        <div class="dashboard-layout__secondary-nav">
          <RouterLink
            to="/profile"
            class="dashboard-layout__link"
            :class="{ 'dashboard-layout__link--active': route.path === '/profile' }"
            @click="closeSidebar"
          >
            پروفایل
          </RouterLink>
          <RouterLink
            v-if="auth.user?.role === 'ADMIN'"
            to="/admin"
            class="dashboard-layout__link"
            @click="closeSidebar"
          >
            پنل مدیریت
          </RouterLink>
          <RouterLink
            v-else-if="auth.user?.role === 'PROVIDER'"
            to="/provider"
            class="dashboard-layout__link"
            @click="closeSidebar"
          >
            پنل ارائه‌دهنده
          </RouterLink>
        </div>
      </aside>

      <div class="dashboard-layout__content">
        <div class="dashboard-layout__mobile-bar">
          <button
            type="button"
            class="dashboard-layout__menu-button"
            aria-label="منو"
            @click="sidebarOpen = !sidebarOpen"
          >
            ☰ منو
          </button>
        </div>
        <div class="dashboard-layout__main">
          <RouterView />
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  flex: 1;
}

.dashboard-layout__overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background-color: rgb(0 0 0 / 50%);
}

@media (min-width: 1024px) {
  .dashboard-layout__overlay {
    display: none;
  }
}

.dashboard-layout__sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 50;
  width: 14rem;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1rem;
  transition: transform 0.2s ease;
  transform: translateX(100%);
}

.dashboard-layout__sidebar--open {
  transform: translateX(0);
}

@media (min-width: 1024px) {
  .dashboard-layout__sidebar {
    position: static;
    transform: translateX(0);
  }
}

.dashboard-layout__nav,
.dashboard-layout__secondary-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dashboard-layout__secondary-nav {
  margin-top: 2rem;
}

.dashboard-layout__link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.dashboard-layout__link:hover {
  background-color: var(--color-bg);
}

.dashboard-layout__link--active {
  background-color: var(--color-primary);
  color: white;
}

.dashboard-layout__link--active:hover {
  background-color: var(--color-primary);
  color: white;
}

.dashboard-layout__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.dashboard-layout__mobile-bar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
}

@media (min-width: 1024px) {
  .dashboard-layout__mobile-bar {
    display: none;
  }
}

.dashboard-layout__menu-button {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: none;
  font: inherit;
  cursor: pointer;
}

.dashboard-layout__menu-button:hover {
  background-color: var(--color-bg);
}

.dashboard-layout__main {
  flex: 1;
  padding: 1rem;
}

@media (min-width: 640px) {
  .dashboard-layout__main {
    padding: 1.5rem;
  }
}
</style>
