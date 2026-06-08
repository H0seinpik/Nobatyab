<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPut } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

const bio = ref("");
const slotDurationMinutes = ref(30);
const isAcceptingBookings = ref(true);
const loading = ref(false);
const message = ref("");

onMounted(async () => {
  const res = await apiGet<{ bio: string | null; slotDurationMinutes: number; isAcceptingBookings: boolean }>(
    "/provider/profile",
  );
  bio.value = res.data.bio ?? "";
  slotDurationMinutes.value = res.data.slotDurationMinutes;
  isAcceptingBookings.value = res.data.isAcceptingBookings;
});

async function save() {
  loading.value = true;
  try {
    await apiPut("/provider/profile", {
      bio: bio.value,
      slotDurationMinutes: Number(slotDurationMinutes.value),
      isAcceptingBookings: isAcceptingBookings.value,
    });
    message.value = "ذخیره شد";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">پروفایل</h1>
    <UiCard class="max-w-lg space-y-4">
      <UiInput v-model="bio" label="بیوگرافی" />
      <UiInput v-model="slotDurationMinutes" label="مدت اسلات (دقیقه)" type="number" />
      <label class="flex items-center gap-2 text-sm">
        <input v-model="isAcceptingBookings" type="checkbox" />
        پذیرش نوبت فعال
      </label>
      <UiButton :loading="loading" @click="save">ذخیره</UiButton>
      <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
    </UiCard>
  </div>
</template>
