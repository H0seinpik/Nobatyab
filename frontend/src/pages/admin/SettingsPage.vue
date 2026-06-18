<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiGet, apiPatch } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { settingsFormSchema } from "@/schemas/admin/settings.schema";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

interface AppSetting {
  key: string;
  value: string;
  group: string;
  label: string;
  type: string;
}

const pageLoading = ref(true);
const success = ref("");
const error = ref("");

const { values, fieldError, touch, isValid, submitting, validateAll } = useZodForm(settingsFormSchema, {
  "site.title": "",
  "site.description": "",
  "contact.email": "",
  "contact.phone": "",
  "contact.address": "",
});

onMounted(async () => {
  try {
    const res = await apiGet<{ settings: AppSetting[] }>("/admin/settings");
    for (const s of res.data.settings) {
      if (s.key in values) {
        (values as Record<string, string>)[s.key] = s.value;
      }
    }
  } finally {
    pageLoading.value = false;
  }
});

async function save() {
  success.value = "";
  error.value = "";
  if (!validateAll()) return;
  submitting.value = true;
  try {
    await apiPatch("/admin/settings", {
      settings: Object.entries(values).map(([key, value]) => ({ key, value: String(value ?? "") })),
    });
    success.value = "تنظیمات با موفقیت ذخیره شد";
  } catch {
    error.value = "خطا در ذخیره تنظیمات";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="settings-page">
    <PageHeader title="تنظیمات سایت" description="مدیریت محتوای قابل تنظیم برنامه" />

    <div v-if="pageLoading" class="settings-page__content">
      <SkeletonForm :fields="5" />
    </div>

    <ContentFade v-else class="settings-page__content settings-page__stack">
      <UiCard>
        <h2 class="settings-page__section-title">عمومی</h2>
        <form class="settings-page__form" @submit.prevent="save">
          <UiInput
            v-model="values['site.title']"
            label="عنوان سایت"
            required
            :error="fieldError('site.title')"
            @blur="touch('site.title')"
          />
          <UiInput
            v-model="values['site.description']"
            label="توضیحات سایت"
            :error="fieldError('site.description')"
            @blur="touch('site.description')"
          />
          <h2 class="settings-page__section-title settings-page__section-title--contact">تماس</h2>
          <UiInput
            v-model="values['contact.email']"
            label="ایمیل"
            type="email"
            :error="fieldError('contact.email')"
            @blur="touch('contact.email')"
          />
          <UiInput
            v-model="values['contact.phone']"
            label="تلفن"
            :error="fieldError('contact.phone')"
            @blur="touch('contact.phone')"
          />
          <UiInput
            v-model="values['contact.address']"
            label="آدرس"
            :error="fieldError('contact.address')"
            @blur="touch('contact.address')"
          />
          <UiAlert v-if="success" variant="success">{{ success }}</UiAlert>
          <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>
          <UiButton type="submit" :loading="submitting" :disabled="!isValid || submitting">
            ذخیره تنظیمات
          </UiButton>
        </form>
      </UiCard>
    </ContentFade>
  </div>
</template>

<style scoped>
.settings-page__content {
  max-width: 42rem;
}

.settings-page__stack > * + * {
  margin-top: 1.5rem;
}

.settings-page__section-title {
  margin-bottom: 1rem;
  font-weight: 600;
}

.settings-page__section-title--contact {
  padding-top: 0.5rem;
}

.settings-page__form > * + * {
  margin-top: 1rem;
}
</style>
