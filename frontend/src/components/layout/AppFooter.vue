<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useSettingsStore } from "@/stores/settings";
import { onMounted } from "vue";

const settings = useSettingsStore();
const year = new Date().getFullYear();

onMounted(() => {
  void settings.fetchPublic();
});

const footerLinks = [
  { to: "/services", label: "خدمات" },
  { to: "/providers", label: "ارائه‌دهندگان" },
  { to: "/smart-booking", label: "رزرو هوشمند" },
  { to: "/login", label: "ورود" },
];
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner container">
      <div class="app-footer__brand">
        <RouterLink to="/" class="app-footer__logo">نوبت‌یاب</RouterLink>
        <p class="app-footer__tagline">
          {{ settings.get("site.description", "رزرو آنلاین نوبت") }}
        </p>
      </div>
      <nav class="app-footer__nav" aria-label="لینک‌های پاورقی">
        <RouterLink v-for="link in footerLinks" :key="link.to" :to="link.to" class="app-footer__link">
          {{ link.label }}
        </RouterLink>
      </nav>
      <div class="app-footer__meta">
        <p>© {{ year }} نوبت‌یاب. تمامی حقوق محفوظ است.</p>
        <p v-if="settings.get('site.email')" class="app-footer__contact">
          {{ settings.get("site.email") }}
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding-block: var(--space-10);
}

.app-footer__inner {
  display: grid;
  gap: var(--space-8);
}

@media (min-width: 768px) {
  .app-footer__inner {
    grid-template-columns: 2fr 1fr 1fr;
    align-items: start;
  }
}

.app-footer__logo {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.app-footer__tagline {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-muted);
  line-height: var(--leading-relaxed);
  max-width: 20rem;
}

.app-footer__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.app-footer__link {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
}

.app-footer__link:hover {
  color: var(--color-primary);
}

.app-footer__meta {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.app-footer__contact {
  margin-top: var(--space-2);
}
</style>
