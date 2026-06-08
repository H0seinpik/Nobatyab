<script setup lang="ts">
import { RouterLink } from "vue-router";
import UiCard from "@/components/ui/UiCard.vue";
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">پنل مدیریت</h1>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink to="/admin/categories"><UiCard>دسته‌بندی‌ها</UiCard></RouterLink>
      <RouterLink to="/admin/services"><UiCard>خدمات</UiCard></RouterLink>
      <RouterLink to="/admin/users"><UiCard>کاربران</UiCard></RouterLink>
      <RouterLink to="/admin/service-requests"><UiCard>درخواست‌های خدمت</UiCard></RouterLink>
      <RouterLink to="/admin/appointments"><UiCard>نوبت‌ها</UiCard></RouterLink>
    </div>
  </div>
</template>
