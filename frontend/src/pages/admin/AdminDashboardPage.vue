<script setup lang="ts">
import { RouterLink } from "vue-router";
import UiCard from "@/components/ui/UiCard.vue";
</script>

<template>
  <div class="admin-dashboard-page">
    <h1 class="admin-dashboard-page__title">پنل مدیریت</h1>
    <div class="admin-dashboard-page__grid">
      <RouterLink to="/admin/categories"><UiCard>دسته‌بندی‌ها</UiCard></RouterLink>
      <RouterLink to="/admin/services"><UiCard>خدمات</UiCard></RouterLink>
      <RouterLink to="/admin/users"><UiCard>کاربران</UiCard></RouterLink>
      <RouterLink to="/admin/service-requests"><UiCard>درخواست‌های خدمت</UiCard></RouterLink>
      <RouterLink to="/admin/provider-requests"><UiCard>درخواست‌های ارائه‌دهنده</UiCard></RouterLink>
      <RouterLink to="/admin/appointments"><UiCard>نوبت‌ها</UiCard></RouterLink>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.admin-dashboard-page__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .admin-dashboard-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .admin-dashboard-page__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
