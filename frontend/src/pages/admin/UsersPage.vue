<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPatch } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

const users = ref<User[]>([]);

async function load() {
  const res = await apiGet<User[]>("/admin/users");
  users.value = res.data;
}

async function updateUser(user: User, patch: Partial<User>) {
  await apiPatch(`/admin/users/${user.id}`, patch);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">کاربران</h1>
    <div class="space-y-3">
      <UiCard v-for="user in users" :key="user.id">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-semibold">{{ user.fullName }}</p>
            <p class="text-sm text-[var(--color-muted)]">{{ user.email }}</p>
            <UiBadge class="mt-2">{{ user.role }}</UiBadge>
          </div>
          <div class="flex flex-wrap gap-2">
            <UiButton variant="secondary" @click="updateUser(user, { isActive: !user.isActive })">
              {{ user.isActive ? "غیرفعال" : "فعال" }}
            </UiButton>
            <UiButton v-if="user.role !== 'ADMIN'" variant="ghost" @click="updateUser(user, { role: 'PROVIDER' })">
              ارائه‌دهنده
            </UiButton>
            <UiButton v-if="user.role !== 'ADMIN'" variant="ghost" @click="updateUser(user, { role: 'USER' })">
              کاربر
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
