<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useZodForm } from "@/composables/useZodForm";
import { providerProfileFormSchema } from "@/schemas/provider.schema";
import { getProviderProfile, updateProviderProfile } from "@/services/provider.service";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const pageLoading = ref(true);
const message = ref("");

const { values, fieldError, touch, isValid, submitting, handleSubmit } = useZodForm(
  providerProfileFormSchema,
  {
    specialization: "",
    bio: "",
    address: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    slotDurationMinutes: 30,
    isAcceptingBookings: true,
  },
);

onMounted(async () => {
  try {
    const profile = await getProviderProfile();
    values.specialization = profile.specialization ?? "";
    values.bio = profile.bio ?? "";
    values.address = profile.address ?? "";
    values.latitude = profile.latitude ?? undefined;
    values.longitude = profile.longitude ?? undefined;
    values.slotDurationMinutes = profile.slotDurationMinutes;
    values.isAcceptingBookings = profile.isAcceptingBookings;
  } finally {
    pageLoading.value = false;
  }
});

async function save() {
  await handleSubmit(async (data) => {
    await updateProviderProfile({
      specialization: data.specialization || undefined,
      bio: data.bio || undefined,
      address: data.address || undefined,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
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
    <div v-if="pageLoading" class="max-w-lg"><SkeletonForm :fields="6" /></div>
    <ContentFade v-else>
      <UiCard class="max-w-lg space-y-4">
        <form class="space-y-4" @submit.prevent="save">
          <UiInput
            v-model="values.specialization"
            label="تخصص"
            :error="fieldError('specialization')"
            @blur="touch('specialization')"
          />
          <UiInput
            v-model="values.bio"
            label="بیوگرافی"
            :error="fieldError('bio')"
            @blur="touch('bio')"
          />
          <UiInput
            v-model="values.address"
            label="آدرس / موقعیت"
            :error="fieldError('address')"
            @blur="touch('address')"
          />
          <UiInput
            v-model.number="values.latitude"
            label="عرض جغرافیایی"
            type="number"
            step="any"
            :error="fieldError('latitude')"
            @blur="touch('latitude')"
          />
          <UiInput
            v-model.number="values.longitude"
            label="طول جغرافیایی"
            type="number"
            step="any"
            :error="fieldError('longitude')"
            @blur="touch('longitude')"
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
