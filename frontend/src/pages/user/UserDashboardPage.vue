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
    profile.value = profile.value
      ? { ...profile.value, fullName: updated.fullName }
      : {
          id: updated.id,
          fullName: updated.fullName,
          phone: updated.phone,
          avatarUrl: updated.avatarUrl,
          email: updated.email,
        };
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
  <div>
    <h1 class="mb-6 text-2xl font-bold">داشبورد کاربری</h1>

    <UiAlert v-if="loadError" variant="error" class="mb-4">{{ loadError }}</UiAlert>

    <div v-if="pageLoading" class="space-y-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonForm :fields="2" />
    </div>

    <ContentFade v-else class="space-y-6">
      <section>
        <h2 class="mb-3 text-lg font-semibold">اطلاعات پروفایل</h2>
        <UiCard>
          <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div class="flex shrink-0 flex-col items-center gap-3">
              <div
                v-if="displayAvatarUrl"
                class="h-24 w-24 overflow-hidden rounded-full border border-[var(--color-border)]"
              >
                <img :src="displayAvatarUrl" alt="تصویر پروفایل" class="h-full w-full object-cover" />
              </div>
              <div
                v-else
                class="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-bold text-white"
              >
                {{ initials }}
              </div>
              <AvatarUpload @uploaded="syncProfileAvatar" />
            </div>

            <dl class="grid flex-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-[var(--color-muted)]">نام</dt>
                <dd class="mt-1 font-medium">{{ profile?.fullName ?? "—" }}</dd>
              </div>
              <div>
                <dt class="text-[var(--color-muted)]">شماره تماس</dt>
                <dd class="mt-1 font-medium">{{ profile?.phone ?? "—" }}</dd>
              </div>
            </dl>
          </div>
        </UiCard>
      </section>

      <section>
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold">نوبت‌ها</h2>
          <div class="flex flex-wrap gap-2">
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
          class="mb-3"
        />

        <div v-if="!activeAppointments.length" class="space-y-3">
          <UiCard class="text-center text-[var(--color-muted)]">
            <p>
              {{
                appointmentTab === "upcoming"
                  ? "نوبت آینده‌ای ثبت نشده است."
                  : "نوبت انجام‌شده‌ای وجود ندارد."
              }}
            </p>
          </UiCard>
          <div v-if="appointmentTab === 'upcoming'" class="text-center">
            <RouterLink to="/smart-booking">
              <UiButton type="button">رزرو هوشمند</UiButton>
            </RouterLink>
          </div>
        </div>

        <div v-else-if="!filteredAppointments.length" class="space-y-3">
          <UiCard class="text-center text-[var(--color-muted)]">
            <p>نوبتی با این نام یافت نشد.</p>
          </UiCard>
        </div>

        <div v-else class="space-y-3">
          <UiCard v-for="apt in filteredAppointments" :key="apt.id">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-medium">{{ apt.providerService.service.name }}</p>
                <p class="text-sm text-[var(--color-muted)]">{{ apt.provider.user.fullName }}</p>
                <p class="mt-1 text-sm">{{ formatJalaliDateTime(apt.startAt) }}</p>
              </div>
              <AppointmentStatusBadge :status="apt.status" />
            </div>
          </UiCard>
          <div class="text-center">
            <RouterLink to="/appointments" class="text-sm text-[var(--color-primary)] hover:underline">
              مشاهده همه نوبت‌ها
            </RouterLink>
          </div>
        </div>
      </section>

      <section>
        <h2 class="mb-3 text-lg font-semibold">تنظیمات</h2>
        <div class="grid gap-6 lg:grid-cols-2">
          <UiCard>
            <h3 class="mb-4 font-medium">ویرایش نام</h3>
            <form class="space-y-4" @submit.prevent="saveName">
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
            <h3 class="mb-4 font-medium">تغییر رمز عبور</h3>
            <form class="space-y-4" @submit.prevent="changePassword">
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
