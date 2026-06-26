import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore, type UserRole } from "@/stores/auth";
import { useNotificationsStore } from "@/stores/notifications";
import { getNotificationsPath, isNotificationsRoute } from "@/utils/notificationRoute";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/DefaultLayout.vue"),
      children: [
        { path: "", name: "home", component: () => import("@/pages/public/HomePage.vue") },
        { path: "services", name: "services", component: () => import("@/pages/public/ServicesPage.vue") },
        { path: "providers", name: "providers", component: () => import("@/pages/public/ProvidersPage.vue") },
        {
          path: "providers/:id",
          name: "provider-detail",
          component: () => import("@/pages/public/ProviderDetailPage.vue"),
        },
        {
          path: "dashboard",
          name: "user-dashboard",
          component: () => import("@/pages/user/UserDashboardPage.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "appointments",
          name: "my-appointments",
          component: () => import("@/pages/user/MyAppointmentsPage.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("@/pages/user/ProfilePage.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "availability",
          name: "availability",
          component: () => import("@/pages/user/AvailabilityPage.vue"),
          meta: { requiresAuth: true, roles: ["USER"] as UserRole[] },
        },
        {
          path: "smart-booking",
          name: "smart-booking",
          component: () => import("@/pages/user/SmartBookingPage.vue"),
          meta: { requiresAuth: true, roles: ["USER"] as UserRole[] },
        },
        {
          path: "notifications",
          name: "notifications",
          component: () => import("@/pages/notifications/NotificationsPage.vue"),
          meta: { requiresAuth: true },
        },
        { path: "login", name: "login", component: () => import("@/pages/auth/LoginPage.vue") },
        { path: "register", name: "register", component: () => import("@/pages/auth/RegisterPage.vue") },
        {
          path: "forgot-password",
          name: "forgot-password",
          component: () => import("@/pages/auth/ForgotPasswordPage.vue"),
        },
        {
          path: "reset-password",
          name: "reset-password",
          component: () => import("@/pages/auth/ResetPasswordPage.vue"),
        },
      ],
    },
    {
      path: "/provider",
      component: () => import("@/layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true, roles: ["PROVIDER"] as UserRole[] },
      children: [
        { path: "", name: "provider-dashboard", component: () => import("@/pages/provider/ProviderDashboardPage.vue") },
        { path: "profile", redirect: "/profile" },
        {
          path: "schedule",
          name: "provider-schedule",
          component: () => import("@/pages/provider/SchedulePage.vue"),
        },
        {
          path: "services",
          name: "provider-services",
          component: () => import("@/pages/provider/ServicesPage.vue"),
        },
        {
          path: "appointments",
          name: "provider-appointments",
          component: () => import("@/pages/provider/AppointmentsPage.vue"),
        },
        {
          path: "service-requests",
          name: "provider-service-requests",
          component: () => import("@/pages/provider/ServiceRequestsPage.vue"),
        },
        {
          path: "notifications",
          name: "provider-notifications",
          component: () => import("@/pages/notifications/NotificationsPage.vue"),
        },
      ],
    },
    {
      path: "/admin",
      component: () => import("@/layouts/DashboardLayout.vue"),
      meta: { requiresAuth: true, roles: ["ADMIN"] as UserRole[] },
      children: [
        { path: "", name: "admin-dashboard", component: () => import("@/pages/admin/AdminDashboardPage.vue") },
        { path: "categories", name: "admin-categories", component: () => import("@/pages/admin/CategoriesPage.vue") },
        { path: "services", name: "admin-services", component: () => import("@/pages/admin/ServicesPage.vue") },
        { path: "users", name: "admin-users", component: () => import("@/pages/admin/UsersPage.vue") },
        {
          path: "service-requests",
          name: "admin-service-requests",
          component: () => import("@/pages/admin/ServiceRequestsPage.vue"),
        },
        {
          path: "provider-requests",
          name: "admin-provider-requests",
          component: () => import("@/pages/admin/ProviderRequestsPage.vue"),
        },
        {
          path: "appointments",
          name: "admin-appointments",
          component: () => import("@/pages/admin/AppointmentsPage.vue"),
        },
        {
          path: "settings",
          name: "admin-settings",
          component: () => import("@/pages/admin/SettingsPage.vue"),
        },
        {
          path: "notifications",
          name: "admin-notifications",
          component: () => import("@/pages/notifications/NotificationsPage.vue"),
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (localStorage.getItem("accessToken") && !auth.user) {
    const result = await auth.fetchMe();
    if (result === "changed") {
      await auth.logout();
      return { name: "login", query: { reason: "session-changed", redirect: to.fullPath } };
    }
    if (result === "invalid" && to.meta.requiresAuth) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  const roles = to.meta.roles as UserRole[] | undefined;
  if (roles && auth.user && !roles.includes(auth.user.role)) {
    if (to.path.startsWith("/provider")) {
      const result = await auth.syncSession();
      if (result === "changed") {
        await auth.logout();
        return { name: "login", query: { reason: "session-changed", redirect: to.fullPath } };
      }
    }
    return { name: "home" };
  }

  if (
    auth.isAuthenticated &&
    to.path === "/notifications" &&
    (auth.user?.role === "PROVIDER" || auth.user?.role === "ADMIN")
  ) {
    return getNotificationsPath(auth.user.role);
  }
});

router.afterEach((to) => {
  const hasToken = localStorage.getItem("accessToken");
  const isProtected = to.matched.some((record) => record.meta.requiresAuth);
  if (hasToken && isProtected) {
    const notifications = useNotificationsStore();
    notifications.startPolling();
    void notifications.fetchUnreadCount();
    if (isNotificationsRoute(to.path)) {
      void notifications.fetchTabCounts();
    }
  }
});

export default router;
