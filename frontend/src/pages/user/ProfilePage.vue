<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import AvatarUpload from "@/components/profile/AvatarUpload.vue";
import ThemeSettings from "@/components/profile/ThemeSettings.vue";
import ProfilePageHeader from "@/components/profile/ProfilePageHeader.vue";
import AccountProfileSection from "@/components/profile/AccountProfileSection.vue";
import ChangePasswordSection from "@/components/profile/ChangePasswordSection.vue";
import ProviderBusinessProfileSection from "@/components/profile/ProviderBusinessProfileSection.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import {
  getMyProviderRequest,
  submitProviderRequest,
  type ProviderRequest,
} from "@/services/providerRequest.service";

const auth = useAuthStore();
const pageLoading = ref(true);

const providerRequest = ref<ProviderRequest | null>(null);
const providerRequestNote = ref("");
const providerRequestLoading = ref(false);
const providerRequestSubmitting = ref(false);
const providerRequestSuccess = ref("");
const providerRequestError = ref("");

async function loadPage() {
  try {
    await auth.fetchMe();
    if (auth.user?.role === "USER") {
      providerRequestLoading.value = true;
      try {
        providerRequest.value = await getMyProviderRequest();
      } finally {
        providerRequestLoading.value = false;
      }
    }
  } finally {
    pageLoading.value = false;
  }
}

onMounted(loadPage);

async function submitProviderApplication() {
  providerRequestSuccess.value = "";
  providerRequestError.value = "";
  if (providerRequestSubmitting.value) return;

  providerRequestSubmitting.value = true;
  try {
    providerRequest.value = await submitProviderRequest(providerRequestNote.value.trim() || undefined);
    providerRequestNote.value = "";
    providerRequestSuccess.value = "درخواست شما با موفقیت ثبت شد و در انتظار بررسی است.";
  } catch (e: unknown) {
    const err = e as {
      response?: { status?: number; data?: { error?: { message?: string } } };
    };
    const msg = err.response?.data?.error?.message ?? "";
    const status = err.response?.status;
    if (msg.toLowerCase().includes("pending")) {
      providerRequestError.value = "شما قبلاً یک درخواست در انتظار دارید.";
    } else if (msg.toLowerCase().includes("already a provider")) {
      providerRequestError.value = "شما در حال حاضر ارائه‌دهنده هستید.";
    } else if (status === 403) {
      providerRequestError.value = "فقط کاربران عادی می‌توانند درخواست ارسال کنند.";
    } else if (status === 401) {
      providerRequestError.value = "لطفاً دوباره وارد حساب کاربری خود شوید.";
    } else if (msg) {
      providerRequestError.value = msg;
    } else {
      providerRequestError.value = "ارسال درخواست ناموفق بود. لطفاً دوباره تلاش کنید.";
    }
  } finally {
    providerRequestSubmitting.value = false;
  }
}
</script>

<template>
  <div>
    <ProfilePageHeader title="پروفایل کاربری" />

    <div v-if="pageLoading" class="max-w-lg space-y-6">
      <SkeletonForm :fields="7" />
      <SkeletonForm :fields="3" />
    </div>

    <ContentFade v-else class="max-w-lg space-y-6">
      <UiCard>
        <h2 class="mb-4 font-semibold">تصویر پروفایل</h2>
        <AvatarUpload />
      </UiCard>

      <AccountProfileSection />

      <ProviderBusinessProfileSection v-if="auth.user?.role === 'PROVIDER'" />

      <UiCard v-if="auth.user?.role === 'USER'">
        <h2 class="mb-2 font-semibold">درخواست ارائه‌دهنده شدن</h2>
        <p class="mb-4 text-sm text-[var(--color-muted)]">
          اگر می‌خواهید خدمات خود را در پلتفرم ارائه دهید، درخواست خود را ارسال کنید.
        </p>

        <div v-if="providerRequestLoading" class="text-sm text-[var(--color-muted)]">
          در حال بارگذاری وضعیت درخواست...
        </div>

        <template v-else-if="providerRequest?.status === 'PENDING'">
          <UiAlert variant="info" class="flex flex-wrap items-center gap-2">
            <span>درخواست شما در انتظار بررسی است.</span>
            <StatusBadge kind="review" :value="providerRequest.status" />
          </UiAlert>
        </template>

        <template v-else-if="providerRequest?.status === 'APPROVED'">
          <UiAlert variant="success">درخواست شما تأیید شده است.</UiAlert>
        </template>

        <template v-else-if="providerRequest?.status === 'REJECTED'">
          <UiAlert variant="error" class="mb-4">
            درخواست قبلی رد شده است.
            <span v-if="providerRequest.adminNote"> — {{ providerRequest.adminNote }}</span>
          </UiAlert>
          <form class="space-y-3" @submit.prevent="submitProviderApplication">
            <UiInput v-model="providerRequestNote" label="توضیحات (اختیاری)" />
            <UiButton type="submit" :loading="providerRequestSubmitting" :disabled="providerRequestSubmitting">
              ارسال درخواست جدید
            </UiButton>
          </form>
        </template>

        <template v-else>
          <form class="space-y-3" @submit.prevent="submitProviderApplication">
            <UiInput v-model="providerRequestNote" label="توضیحات (اختیاری)" />
            <UiAlert v-if="providerRequestSuccess" variant="success">{{ providerRequestSuccess }}</UiAlert>
            <UiAlert v-if="providerRequestError" variant="error">{{ providerRequestError }}</UiAlert>
            <UiButton type="submit" :loading="providerRequestSubmitting" :disabled="providerRequestSubmitting">
              ارسال درخواست
            </UiButton>
          </form>
        </template>
      </UiCard>

      <UiCard v-if="auth.user?.role === 'USER'">
        <h2 class="mb-2 font-semibold">رزرو هوشمند</h2>
        <p class="mb-4 text-sm text-[var(--color-muted)]">
          زمان‌های آزاد هفتگی خود را برای پیشنهاد خودکار نوبت تنظیم کنید.
        </p>
        <RouterLink to="/availability">
          <UiButton variant="secondary" type="button">تنظیم زمان‌های آزاد</UiButton>
        </RouterLink>
      </UiCard>

      <UiCard>
        <h2 class="mb-4 font-semibold">تنظیمات ظاهر</h2>
        <ThemeSettings />
      </UiCard>

      <ChangePasswordSection />
    </ContentFade>
  </div>
</template>
