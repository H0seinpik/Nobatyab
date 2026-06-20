<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Calendar } from "lucide-vue-next";

defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="auth-layout">
    <aside class="auth-layout__brand" aria-hidden="true">
      <RouterLink to="/" class="auth-layout__logo">
        <Calendar :size="28" />
        نوبت‌یاب
      </RouterLink>
      <p class="auth-layout__tagline">
        رزرو آنلاین سریع، هوشمند و حرفه‌ای — در هر زمان و هر مکان
      </p>
      <ul class="auth-layout__features">
        <li>انتخاب ارائه‌دهنده و زمان مناسب</li>
        <li>رزرو هوشمند بر اساس دسترسی شما</li>
        <li>یادآوری و مدیریت نوبت‌ها</li>
      </ul>
    </aside>
    <main class="auth-layout__main">
      <div class="auth-layout__card">
        <header class="auth-layout__header">
          <h1 class="auth-layout__title">{{ title }}</h1>
          <p v-if="subtitle" class="auth-layout__subtitle">{{ subtitle }}</p>
        </header>
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  display: grid;
  min-height: calc(100vh - var(--header-height, 4rem) - var(--space-16));
  gap: var(--space-8);
  align-items: center;
}

@media (min-width: 900px) {
  .auth-layout {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
    max-width: 56rem;
    margin-inline: auto;
    width: 100%;
  }
}

.auth-layout__brand {
  display: none;
  padding: var(--space-8);
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--color-primary-subtle) 0%, var(--color-surface) 100%);
  border: 1px solid var(--color-border);
}

@media (min-width: 900px) {
  .auth-layout__brand {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    min-height: 28rem;
    justify-content: center;
  }
}

.auth-layout__logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.auth-layout__tagline {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  max-width: 20rem;
}

.auth-layout__features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.auth-layout__features li::before {
  content: "✓ ";
  color: var(--color-success);
  font-weight: 600;
}

.auth-layout__main {
  width: 100%;
  max-width: 28rem;
  margin-inline: auto;
}

@media (min-width: 900px) {
  .auth-layout__main {
    max-width: none;
    margin-inline: 0;
  }
}

.auth-layout__card {
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

.auth-layout__header {
  margin-bottom: var(--space-6);
}

.auth-layout__title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
}

.auth-layout__subtitle {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
