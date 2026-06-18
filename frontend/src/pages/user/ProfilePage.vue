<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
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
const router = useRouter();
const pageLoading = ref(true);

const providerRequest = ref<ProviderRequest | null>(null);
const providerRequestNote = ref("");
const providerRequestLoading = ref(false);
const providerRequestSubmitting = ref(false);
const providerRequestSuccess = ref("");
const providerRequestError = ref("");

async function handleApprovedRequestLogout() {
  await auth.logout();
  await router.push({ name: "login", query: { reason: "session-changed" } });
}

async function loadPage() {
  try {
    const sessionResult = await auth.fetchMe();
    if (sessionResult === "changed") {
      await handleApprovedRequestLogout();
      return;
    }
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
    } else if (msg.toLowerCase().includes("already a provider") || msg.toLowerCase().includes("approved")) {
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
  <div class="profile-page">
    <ProfilePageHeader title="پروفایل کاربری" />

    <div v-if="pageLoading" class="profile-page__content profile-page__stack">
      <SkeletonForm :fields="7" />
      <SkeletonForm :fields="3" />
    </div>

    <ContentFade v-else class="profile-page__content profile-page__stack">
      <UiCard>
        <h2 class="profile-page__card-title">تصویر پروفایل</h2>
        <AvatarUpload />
      </UiCard>

      <AccountProfileSection />

      <ProviderBusinessProfileSection v-if="auth.user?.role === 'PROVIDER'" />

      <UiCard v-if="auth.user?.role === 'USER'">
        <h2 class="profile-page__section-title">درخواست ارائه‌دهنده شدن</h2>
        <p class="profile-page__section-description">
          اگر می‌خواهید خدمات خود را در پلتفرم ارائه دهید، درخواست خود را ارسال کنید.
        </p>

        <div v-if="providerRequestLoading" class="profile-page__loading-text">
          در حال بارگذاری وضعیت درخواست...
        </div>

        <template v-else-if="providerRequest?.status === 'PENDING'">
          <UiAlert variant="info" class="profile-page__pending-alert">
            <span>درخواست شما در انتظار بررسی است.</span>
            <StatusBadge kind="review" :value="providerRequest.status" />
          </UiAlert>
        </template>

        <template v-else-if="providerRequest?.status === 'REJECTED'">
          <UiAlert variant="error" class="profile-page__rejected-alert">
            درخواست قبلی رد شده است.
            <span v-if="providerRequest.adminNote"> — {{ providerRequest.adminNote }}</span>
          </UiAlert>
          <form class="profile-page__form" @submit.prevent="submitProviderApplication">
            <UiInput v-model="providerRequestNote" label="توضیحات (اختیاری)" />
            <UiButton type="submit" :loading="providerRequestSubmitting" :disabled="providerRequestSubmitting">
              ارسال درخواست جدید
            </UiButton>
          </form>
        </template>

        <template v-else-if="providerRequest?.status === 'APPROVED'">
          <UiAlert variant="info">
            درخواست ارائه‌دهنده شما قبلاً تأیید شده است. برای دسترسی به پنل ارائه‌دهنده با پشتیبانی تماس بگیرید.
          </UiAlert>
        </template>

        <template v-else>
          <form class="profile-page__form" @submit.prevent="submitProviderApplication">
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
        <h2 class="profile-page__section-title">رزرو هوشمند</h2>
        <p class="profile-page__section-description">
          زمان‌های آزاد هفتگی خود را برای پیشنهاد خودکار نوبت تنظیم کنید.
        </p>
        <RouterLink to="/availability">
          <UiButton variant="secondary" type="button">تنظیم زمان‌های آزاد</UiButton>
        </RouterLink>
      </UiCard>

      <UiCard>
        <h2 class="profile-page__card-title">تنظیمات ظاهر</h2>
        <ThemeSettings />
      </UiCard>

      <ChangePasswordSection />
    </ContentFade>
  </div>
</template>

<style scoped>
.profile-page__content {
  max-width: 32rem;
}

.profile-page__stack > * + * {
  margin-top: 1.5rem;
}

.profile-page__card-title {
  margin-bottom: 1rem;
  font-weight: 600;
}

.profile-page__section-title {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.profile-page__section-description {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.profile-page__loading-text {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.profile-page__pending-alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.profile-page__rejected-alert {
  margin-bottom: 1rem;
}

.profile-page__form > * + * {
  margin-top: 0.75rem;
}
</style>
