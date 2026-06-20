import { Router } from "express";
import { Role } from "@prisma/client";
import { providerController } from "./provider.controller.js";
import {
  createProviderServiceSchema,
  createServiceRequestSchema,
  createWorkingHourSchema,
  providerAppointmentIdSchema,
  providerAppointmentQuerySchema,
  providerServiceIdSchema,
  providerServiceScopedSchema,
  providerServiceWorkingHourIdSchema,
  replaceWorkingHoursSchema,
  serviceRequestQuerySchema,
  toggleWorkingDaySchema,
  updateCancellationPolicySchema,
  updateProviderProfileSchema,
  updateProviderServiceSchema,
  updateProviderStatusSchema,
} from "./provider.schema.js";
import {
  validateBody,
  validateParams,
  validateQuery,
  asyncHandler,
} from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const providerDashboardRoutes = Router();

providerDashboardRoutes.use(requireAuth, requireRole(Role.PROVIDER));

providerDashboardRoutes.get("/profile", asyncHandler(providerController.getProfile));
providerDashboardRoutes.get(
  "/dashboard/overview",
  asyncHandler(providerController.dashboardOverview),
);
providerDashboardRoutes.put(
  "/profile",
  validateBody(updateProviderProfileSchema),
  asyncHandler(providerController.updateProfile),
);
providerDashboardRoutes.patch(
  "/profile",
  validateBody(updateProviderProfileSchema),
  asyncHandler(providerController.updateProfile),
);

providerDashboardRoutes.get(
  "/services/:providerServiceId/working-hours",
  validateParams(providerServiceScopedSchema),
  asyncHandler(providerController.getWorkingHours),
);
providerDashboardRoutes.post(
  "/services/:providerServiceId/working-hours",
  validateParams(providerServiceScopedSchema),
  validateBody(createWorkingHourSchema),
  asyncHandler(providerController.createWorkingHour),
);
providerDashboardRoutes.put(
  "/services/:providerServiceId/working-hours",
  validateParams(providerServiceScopedSchema),
  validateBody(replaceWorkingHoursSchema),
  asyncHandler(providerController.replaceWorkingHours),
);
providerDashboardRoutes.delete(
  "/services/:providerServiceId/working-hours/:id",
  validateParams(providerServiceWorkingHourIdSchema),
  asyncHandler(providerController.deleteWorkingHour),
);
providerDashboardRoutes.patch(
  "/services/:providerServiceId/working-day/:id",
  validateParams(providerServiceWorkingHourIdSchema),
  validateBody(toggleWorkingDaySchema),
  asyncHandler(providerController.toggleWorkingDay),
);
providerDashboardRoutes.patch(
  "/services/:providerServiceId/working-hours/:id/status",
  validateParams(providerServiceWorkingHourIdSchema),
  validateBody(updateProviderStatusSchema),
  asyncHandler(providerController.updateWorkingHourStatus),
);
providerDashboardRoutes.delete(
  "/services/:providerServiceId/working-day/:id",
  validateParams(providerServiceWorkingHourIdSchema),
  asyncHandler(providerController.deleteWorkingHour),
);
providerDashboardRoutes.delete(
  "/services/:providerServiceId/availability/:id",
  validateParams(providerServiceWorkingHourIdSchema),
  asyncHandler(providerController.deleteWorkingHour),
);

providerDashboardRoutes.get(
  "/cancellation-policy",
  asyncHandler(providerController.getCancellationPolicy),
);
providerDashboardRoutes.put(
  "/cancellation-policy",
  validateBody(updateCancellationPolicySchema),
  asyncHandler(providerController.updateCancellationPolicy),
);

providerDashboardRoutes.post(
  "/service-requests",
  validateBody(createServiceRequestSchema),
  asyncHandler(providerController.createServiceRequest),
);
providerDashboardRoutes.get(
  "/service-requests",
  validateQuery(serviceRequestQuerySchema),
  asyncHandler(providerController.listServiceRequests),
);

providerDashboardRoutes.get("/services", asyncHandler(providerController.listProviderServices));
providerDashboardRoutes.post(
  "/services",
  validateBody(createProviderServiceSchema),
  asyncHandler(providerController.createProviderService),
);
providerDashboardRoutes.patch(
  "/services/:id",
  validateParams(providerServiceIdSchema),
  validateBody(updateProviderServiceSchema),
  asyncHandler(providerController.updateProviderService),
);
providerDashboardRoutes.delete(
  "/services/:id",
  validateParams(providerServiceIdSchema),
  asyncHandler(providerController.deleteProviderService),
);

providerDashboardRoutes.get(
  "/appointments",
  validateQuery(providerAppointmentQuerySchema),
  asyncHandler(providerController.listAppointments),
);
providerDashboardRoutes.patch(
  "/appointments/:id/confirm",
  validateParams(providerAppointmentIdSchema),
  asyncHandler(providerController.confirmAppointment),
);
providerDashboardRoutes.patch(
  "/appointments/:id/complete",
  validateParams(providerAppointmentIdSchema),
  asyncHandler(providerController.completeAppointment),
);
