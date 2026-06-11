<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPut } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { providerProfileFormSchema } from "@/schemas/provider.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const pageLoading = ref(true);
const message = ref("");

const { values, fieldError, touch, isValid, submitting, handleSubmit } = useZodForm(
  providerProfileFormSchema,
  { bio: "", slotDurationMinutes: 30, isAcceptingBookings: true },
);

onMounted(async () => {
  try {
    const res = await apiGet<{ bio: string | null; slotDurationMinutes: number; isAcceptingBookings: boolean }>(
      "/provider/profile",
    );
    values.bio = res.data.bio ?? "";
    values.slotDurationMinutes = res.data.slotDurationMinutes;
    values.isAcceptingBookings = res.data.isAcceptingBookings;
  } finally {
    pageLoading.value = false;
  }
});

async function save() {
  await handleSubmit(async (data) => {
    await apiPut("/provider/profile", {
      bio: data.bio || undefined,
      slotDurationMinutes: data.slotDurationMinutes,
      isAcceptingBookings: data.isAcceptingBookings,
    });
    message.value = "ذخیره شد";
  });
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">پروفایل</h1>
    <div v-if="pageLoading" class="max-w-lg"><SkeletonForm :fields="3" /></div>
    <ContentFade v-else>
      <UiCard class="max-w-lg space-y-4">
        <form class="space-y-4" @submit.prevent="save">
          <UiInput
            v-model="values.bio"
            label="بیوگرافی"
            :error="fieldError('bio')"
            @blur="touch('bio')"
          />
          <UiInput
            v-model="values.slotDurationMinutes"
            label="مدت اسلات (دقیقه)"
            type="number"
            required
            :error="fieldError('slotDurationMinutes')"
            @blur="touch('slotDurationMinutes')"
          />
          <label class="flex items-center gap-2 text-sm">
            <input v-model="values.isAcceptingBookings" type="checkbox" />
            پذیرش نوبت فعال
          </label>
          <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting">ذخیره</UiButton>
          <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
        </form>
      </UiCard>
    </ContentFade>
  </div>
</template>
