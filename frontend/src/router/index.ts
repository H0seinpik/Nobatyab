import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore, type UserRole } from "@/stores/auth";

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
          path: "appointments",
          name: "my-appointments",
          component: () => import("@/pages/user/MyAppointmentsPage.vue"),
          meta: { requiresAuth: true, roles: ["USER"] as UserRole[] },
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("@/pages/user/ProfilePage.vue"),
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
        { path: "profile", name: "provider-profile", component: () => import("@/pages/provider/ProfilePage.vue") },
        { path: "schedule", name: "provider-schedule", component: () => import("@/pages/provider/SchedulePage.vue") },
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
          path: "appointments",
          name: "admin-appointments",
          component: () => import("@/pages/admin/AppointmentsPage.vue"),
        },
        {
          path: "settings",
          name: "admin-settings",
          component: () => import("@/pages/admin/SettingsPage.vue"),
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (localStorage.getItem("accessToken") && !auth.user) {
    await auth.fetchMe();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  const roles = to.meta.roles as UserRole[] | undefined;
  if (roles && auth.user && !roles.includes(auth.user.role)) {
    return { name: "home" };
  }
});

export default router;
