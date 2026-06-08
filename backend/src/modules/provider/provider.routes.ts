import { Router } from "express";
import { Role } from "@prisma/client";
import { providerController } from "./provider.controller.js";
import {
  createServiceRequestSchema,
  providerAppointmentIdSchema,
  providerAppointmentQuerySchema,
  replaceWorkingHoursSchema,
  serviceRequestQuerySchema,
  updateCancellationPolicySchema,
  updateProviderProfileSchema,
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
providerDashboardRoutes.put(
  "/profile",
  validateBody(updateProviderProfileSchema),
  asyncHandler(providerController.updateProfile),
);

providerDashboardRoutes.get("/working-hours", asyncHandler(providerController.getWorkingHours));
providerDashboardRoutes.put(
  "/working-hours",
  validateBody(replaceWorkingHoursSchema),
  asyncHandler(providerController.replaceWorkingHours),
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
