<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/composables/useLogout";
import { useZodForm } from "@/composables/useZodForm";
import { dashboardNameFormSchema, changePasswordFormSchema } from "@/schemas/profile.schema";
import {
  getUserProfile,
  getUserAppointments,
  type UserProfile,
  type DashboardAppointment,
} from "@/services/user.service";
import { resolveUploadUrl } from "@/utils/uploadUrl";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import AvatarUpload from "@/components/profile/AvatarUpload.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";

const auth = useAuthStore();
const logout = useLogout();

const pageLoading = ref(true);
const profile = ref<UserProfile | null>(null);
const upcoming = ref<DashboardAppointment[]>([]);
const completed = ref<DashboardAppointment[]>([]);
const loadError = ref<string | null>(null);
const appointmentTab = ref<"upcoming" | "completed">("upcoming");
const search = ref("");

const nameSuccess = ref("");
const nameError = ref("");
const passwordSuccess = ref("");
const passwordError = ref("");

const {
  values: nameValues,
  fieldError: nameFieldError,
  touch: nameTouch,
  isValid: nameValid,
  submitting: nameSubmitting,
  validateAll: validateName,
} = useZodForm(dashboardNameFormSchema, { fullName: "" });

const {
  values: passwordValues,
  fieldError: passwordFieldError,
  touch: passwordTouch,
  isValid: passwordValid,
  submitting: passwordSubmitting,
  validateAll: validatePassword,
  reset: resetPasswordForm,
} = useZodForm(changePasswordFormSchema, {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const displayAvatarUrl = computed(() =>
  resolveUploadUrl(auth.user?.avatarUrl ?? profile.value?.image ?? profile.value?.avatarUrl),
);

const initials = computed(() => {
  const name = profile.value?.fullName?.trim();
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
});

const activeAppointments = computed(() =>
  appointmentTab.value === "upcoming" ? upcoming.value : completed.value,
);

const filteredAppointments = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return activeAppointments.value;
  return activeAppointments.value.filter((apt) => {
    const serviceName = apt.providerService.service.name.toLowerCase();
    const providerName = apt.provider.user.fullName.toLowerCase();
    return serviceName.includes(q) || providerName.includes(q);
  });
});

function syncProfileAvatar(avatarUrl: string | null) {
  if (!profile.value) return;
  profile.value = { ...profile.value, avatarUrl, image: avatarUrl };
}

watch(
  () => auth.user?.avatarUrl,
  (avatarUrl) => {
    if (avatarUrl !== undefined) syncProfileAvatar(avatarUrl);
  },
);

async function loadDashboard() {
  loadError.value = null;
  try {
    const [profileData, appointmentsData] = await Promise.all([getUserProfile(), getUserAppointments()]);
    profile.value = profileData;
    upcoming.value = appointmentsData.upcoming;
    completed.value = appointmentsData.completed;
    nameValues.fullName = profileData.fullName;
    await auth.fetchMe();
  } catch {
    loadError.value = "خطا در بارگذاری داشبورد. لطفاً صفحه را رفرش کنید.";
  }
}

onMounted(async () => {
  try {
    await loadDashboard();
  } finally {
    pageLoading.value = false;
  }
});

async function saveName() {
  nameSuccess.value = "";
  nameError.value = "";
  if (!validateName()) return;

  nameSubmitting.value = true;
  try {
    const updated = await auth.updateProfile({ fullName: nameValues.fullName });
    if (profile.value) {
      profile.value = { ...profile.value, fullName: updated.fullName };
    } else {
      profile.value = await getUserProfile();
    }
    nameSuccess.value = "نام با موفقیت به‌روزرسانی شد";
  } catch {
    nameError.value = auth.error ?? "خطا در به‌روزرسانی نام";
  } finally {
    nameSubmitting.value = false;
  }
}

async function changePassword() {
  passwordSuccess.value = "";
  passwordError.value = "";
  if (!validatePassword()) return;

  passwordSubmitting.value = true;
  try {
    await auth.changePassword(passwordValues.currentPassword, passwordValues.newPassword);
    resetPasswordForm();
    passwordSuccess.value = "رمز عبور تغییر کرد. لطفاً دوباره وارد شوید.";
    setTimeout(() => logout(), 1500);
  } catch {
    passwordError.value = auth.error ?? "خطا در تغییر رمز عبور";
  } finally {
    passwordSubmitting.value = false;
  }
}
</script>

<template>
  <div class="user-dashboard-page">
    <h1 class="user-dashboard-page__title">داشبورد کاربری</h1>

    <UiAlert v-if="loadError" variant="error" class="user-dashboard-page__alert">{{ loadError }}</UiAlert>

    <div v-if="pageLoading" class="user-dashboard-page__stack">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonForm :fields="2" />
    </div>

    <ContentFade v-else class="user-dashboard-page__stack">
      <section>
        <h2 class="user-dashboard-page__section-title">اطلاعات پروفایل</h2>
        <UiCard>
          <div class="user-dashboard-page__profile">
            <div class="user-dashboard-page__avatar-block">
              <div v-if="displayAvatarUrl" class="user-dashboard-page__avatar">
                <img :src="displayAvatarUrl" alt="تصویر پروفایل" class="user-dashboard-page__avatar-img" />
              </div>
              <div v-else class="user-dashboard-page__avatar user-dashboard-page__avatar--initials">
                {{ initials }}
              </div>
              <AvatarUpload @uploaded="syncProfileAvatar" />
            </div>

            <dl class="user-dashboard-page__details">
              <div>
                <dt class="user-dashboard-page__detail-label">نام</dt>
                <dd class="user-dashboard-page__detail-value">{{ profile?.fullName ?? "—" }}</dd>
              </div>
              <div>
                <dt class="user-dashboard-page__detail-label">شماره تماس</dt>
                <dd class="user-dashboard-page__detail-value">{{ profile?.phone ?? "—" }}</dd>
              </div>
            </dl>
          </div>
        </UiCard>
      </section>

      <section>
        <div class="user-dashboard-page__appointments-header">
          <h2 class="user-dashboard-page__section-title user-dashboard-page__section-title--inline">نوبت‌ها</h2>
          <div class="user-dashboard-page__tabs">
            <UiButton
              type="button"
              :variant="appointmentTab === 'upcoming' ? 'primary' : 'secondary'"
              @click="appointmentTab = 'upcoming'"
            >
              آینده ({{ upcoming.length }})
            </UiButton>
            <UiButton
              type="button"
              :variant="appointmentTab === 'completed' ? 'primary' : 'secondary'"
              @click="appointmentTab = 'completed'"
            >
              انجام‌شده ({{ completed.length }})
            </UiButton>
          </div>
        </div>

        <UiInput
          v-model="search"
          label="جستجو بر اساس نام"
          placeholder="نام خدمت یا ارائه‌دهنده..."
          class="user-dashboard-page__search"
        />

        <div v-if="!activeAppointments.length" class="user-dashboard-page__list">
          <UiCard class="user-dashboard-page__empty">
            <p>
              {{
                appointmentTab === "upcoming"
                  ? "نوبت آینده‌ای ثبت نشده است."
                  : "نوبت انجام‌شده‌ای وجود ندارد."
              }}
            </p>
          </UiCard>
          <div v-if="appointmentTab === 'upcoming'" class="user-dashboard-page__center">
            <RouterLink to="/smart-booking">
              <UiButton type="button">رزرو هوشمند</UiButton>
            </RouterLink>
          </div>
        </div>

        <div v-else-if="!filteredAppointments.length" class="user-dashboard-page__list">
          <UiCard class="user-dashboard-page__empty">
            <p>نوبتی با این نام یافت نشد.</p>
          </UiCard>
        </div>

        <div v-else class="user-dashboard-page__list">
          <UiCard v-for="apt in filteredAppointments" :key="apt.id">
            <div class="user-dashboard-page__appointment">
              <div>
                <p class="user-dashboard-page__appointment-name">{{ apt.providerService.service.name }}</p>
                <p class="user-dashboard-page__appointment-provider">{{ apt.provider.user.fullName }}</p>
                <p class="user-dashboard-page__appointment-date">{{ formatJalaliDateTime(apt.startAt) }}</p>
              </div>
              <AppointmentStatusBadge :status="apt.status" />
            </div>
          </UiCard>
          <div class="user-dashboard-page__center">
            <RouterLink to="/appointments" class="user-dashboard-page__view-all">
              مشاهده همه نوبت‌ها
            </RouterLink>
          </div>
        </div>
      </section>

      <section>
        <h2 class="user-dashboard-page__section-title">تنظیمات</h2>
        <div class="user-dashboard-page__settings-grid">
          <UiCard>
            <h3 class="user-dashboard-page__card-title">ویرایش نام</h3>
            <form class="user-dashboard-page__form" @submit.prevent="saveName">
              <UiInput
                v-model="nameValues.fullName"
                label="نام کامل"
                required
                :error="nameFieldError('fullName')"
                @blur="nameTouch('fullName')"
              />
              <UiAlert v-if="nameSuccess" variant="success">{{ nameSuccess }}</UiAlert>
              <UiAlert v-if="nameError" variant="error">{{ nameError }}</UiAlert>
              <UiButton
                type="submit"
                :loading="nameSubmitting"
                :disabled="!nameValid || nameSubmitting"
              >
                ذخیره نام
              </UiButton>
            </form>
          </UiCard>

          <UiCard>
            <h3 class="user-dashboard-page__card-title">تغییر رمز عبور</h3>
            <form class="user-dashboard-page__form" @submit.prevent="changePassword">
              <UiInput
                v-model="passwordValues.currentPassword"
                label="رمز عبور فعلی"
                type="password"
                required
                :error="passwordFieldError('currentPassword')"
                @blur="passwordTouch('currentPassword')"
              />
              <UiInput
                v-model="passwordValues.newPassword"
                label="رمز عبور جدید"
                type="password"
                required
                :error="passwordFieldError('newPassword')"
                @blur="passwordTouch('newPassword')"
              />
              <UiInput
                v-model="passwordValues.confirmPassword"
                label="تکرار رمز جدید"
                type="password"
                required
                :error="passwordFieldError('confirmPassword')"
                @blur="passwordTouch('confirmPassword')"
              />
              <UiAlert v-if="passwordSuccess" variant="success">{{ passwordSuccess }}</UiAlert>
              <UiAlert v-if="passwordError" variant="error">{{ passwordError }}</UiAlert>
              <UiButton
                type="submit"
                variant="secondary"
                :loading="passwordSubmitting"
                :disabled="!passwordValid || passwordSubmitting"
              >
                تغییر رمز عبور
              </UiButton>
            </form>
          </UiCard>
        </div>
      </section>
    </ContentFade>
  </div>
</template>

<style scoped>
.user-dashboard-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.user-dashboard-page__alert {
  margin-bottom: 1rem;
}

.user-dashboard-page__stack > * + * {
  margin-top: 1.5rem;
}

.user-dashboard-page__section-title {
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.user-dashboard-page__section-title--inline {
  margin-bottom: 0;
}

.user-dashboard-page__profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .user-dashboard-page__profile {
    flex-direction: row;
    align-items: flex-start;
  }
}

.user-dashboard-page__avatar-block {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.user-dashboard-page__avatar {
  width: 6rem;
  height: 6rem;
  overflow: hidden;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
}

.user-dashboard-page__avatar--initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.user-dashboard-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-dashboard-page__details {
  display: grid;
  flex: 1;
  gap: 0.75rem;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .user-dashboard-page__details {
    grid-template-columns: repeat(2, 1fr);
  }
}

.user-dashboard-page__detail-label {
  color: var(--color-muted);
}

.user-dashboard-page__detail-value {
  margin-top: 0.25rem;
  font-weight: 500;
}

.user-dashboard-page__appointments-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-dashboard-page__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-dashboard-page__search {
  margin-bottom: 0.75rem;
}

.user-dashboard-page__list > * + * {
  margin-top: 0.75rem;
}

.user-dashboard-page__empty {
  text-align: center;
  color: var(--color-muted);
}

.user-dashboard-page__center {
  text-align: center;
}

.user-dashboard-page__appointment {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.user-dashboard-page__appointment-name {
  font-weight: 500;
}

.user-dashboard-page__appointment-provider {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.user-dashboard-page__appointment-date {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.user-dashboard-page__view-all {
  font-size: 0.875rem;
  color: var(--color-primary);
}

.user-dashboard-page__view-all:hover {
  text-decoration: underline;
}

.user-dashboard-page__settings-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .user-dashboard-page__settings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.user-dashboard-page__card-title {
  margin-bottom: 1rem;
  font-weight: 500;
}

.user-dashboard-page__form > * + * {
  margin-top: 1rem;
}
</style>
