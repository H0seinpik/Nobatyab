<script setup lang="ts">
import { RouterLink } from "vue-router";
import UiCard from "@/components/ui/UiCard.vue";
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">پنل ارائه‌دهنده</h1>
    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink to="/provider/profile"><UiCard class="hover:border-[var(--color-primary)]">پروفایل و مدت اسلات</UiCard></RouterLink>
      <RouterLink to="/provider/schedule"><UiCard class="hover:border-[var(--color-primary)]">برنامه کاری</UiCard></RouterLink>
      <RouterLink to="/provider/services"><UiCard class="hover:border-[var(--color-primary)]">خدمات من</UiCard></RouterLink>
      <RouterLink to="/provider/appointments"><UiCard class="hover:border-[var(--color-primary)]">مدیریت نوبت‌ها</UiCard></RouterLink>
      <RouterLink to="/provider/service-requests"><UiCard class="hover:border-[var(--color-primary)]">درخواست خدمات</UiCard></RouterLink>
    </div>
  </div>
</template>
