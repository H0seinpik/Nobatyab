<script setup lang="ts">
import { RouterLink } from "vue-router";
import UiCard from "@/components/ui/UiCard.vue";
</script>

<template>
  <div class="provider-dashboard-page">
    <h1 class="provider-dashboard-page__title">پنل ارائه‌دهنده</h1>
    <div class="provider-dashboard-page__grid">
      <RouterLink to="/provider/profile"><UiCard class="provider-dashboard-page__card">پروفایل و مدت اسلات</UiCard></RouterLink>
      <RouterLink to="/provider/schedule"><UiCard class="provider-dashboard-page__card">برنامه کاری</UiCard></RouterLink>
      <RouterLink to="/provider/services"><UiCard class="provider-dashboard-page__card">خدمات من</UiCard></RouterLink>
      <RouterLink to="/provider/appointments"><UiCard class="provider-dashboard-page__card">مدیریت نوبت‌ها</UiCard></RouterLink>
      <RouterLink to="/provider/service-requests"><UiCard class="provider-dashboard-page__card">درخواست خدمات</UiCard></RouterLink>
    </div>
  </div>
</template>

<style scoped>
.provider-dashboard-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.provider-dashboard-page__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .provider-dashboard-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.provider-dashboard-page__card:hover {
  border-color: var(--color-primary);
}
</style>
