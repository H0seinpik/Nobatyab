import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiGet, apiPost, apiPatch, setTokens } from "@/services/api";

export type UserRole = "USER" | "PROVIDER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  providerProfileId: string | null;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);

  async function fetchMe() {
    try {
      const res = await apiGet<User>("/auth/me", undefined, { skipGlobalLoading: true });
      user.value = res.data;
    } catch {
      user.value = null;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiPost<{ user: User; accessToken: string; refreshToken: string }>(
        "/auth/login",
        { email, password },
      );
      setTokens(res.data.accessToken, res.data.refreshToken);
      user.value = res.data.user;
      return res.data.user;
    } catch (e: unknown) {
      error.value = "ایمیل یا رمز عبور اشتباه است";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const res = await apiPost<{ user: User; accessToken: string; refreshToken: string }>(
        "/auth/register",
        data,
      );
      setTokens(res.data.accessToken, res.data.refreshToken);
      user.value = res.data.user;
      return res.data.user;
    } catch {
      error.value = "ثبت‌نام ناموفق بود";
      throw new Error("register failed");
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await apiPost("/auth/logout", { refreshToken: localStorage.getItem("refreshToken") });
    } catch {
      // ignore — still clear local session
    }
    setTokens(null, null);
    user.value = null;
    error.value = null;
    loading.value = false;
  }

  async function updateProfile(data: { fullName?: string; email?: string }) {
    error.value = null;
    try {
      const res = await apiPatch<User>("/auth/me", data);
      user.value = res.data;
      return res.data;
    } catch {
      error.value = "به‌روزرسانی پروفایل ناموفق بود";
      throw new Error("update profile failed");
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    error.value = null;
    try {
      await apiPatch("/auth/password", { currentPassword, newPassword });
    } catch {
      error.value = "رمز عبور فعلی اشتباه است یا تغییر رمز ناموفق بود";
      throw new Error("change password failed");
    }
  }

  async function forgotPassword(email: string) {
    await apiPost("/auth/forgot-password", { email });
  }

  async function resetPassword(token: string, password: string) {
    await apiPost("/auth/reset-password", { token, password });
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    fetchMe,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };
});
