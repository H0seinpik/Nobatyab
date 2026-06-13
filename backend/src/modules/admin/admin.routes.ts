import { Router } from "express";
import { Role } from "@prisma/client";
import { adminController } from "./admin.controller.js";
import {
  adminAppointmentQuerySchema,
  adminProviderRequestQuerySchema,
  adminReviewServiceRequestSchema,
  adminServiceRequestIdSchema,
  adminServiceRequestQuerySchema,
  adminUpdateUserSchema,
  adminUserIdSchema,
  adminUserQuerySchema,
} from "./admin.schema.js";
import {
  validateBody,
  validateParams,
  validateQuery,
  asyncHandler,
} from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole(Role.ADMIN));

adminRoutes.get("/users", validateQuery(adminUserQuerySchema), asyncHandler(adminController.listUsers));
adminRoutes.patch(
  "/users/:id",
  validateParams(adminUserIdSchema),
  validateBody(adminUpdateUserSchema),
  asyncHandler(adminController.updateUser),
);

adminRoutes.get(
  "/service-requests",
  validateQuery(adminServiceRequestQuerySchema),
  asyncHandler(adminController.listServiceRequests),
);
adminRoutes.patch(
  "/service-requests/:id",
  validateParams(adminServiceRequestIdSchema),
  validateBody(adminReviewServiceRequestSchema),
  asyncHandler(adminController.reviewServiceRequest),
);

adminRoutes.get(
  "/provider-requests",
  validateQuery(adminProviderRequestQuerySchema),
  asyncHandler(adminController.listProviderRequests),
);

adminRoutes.get(
  "/appointments",
  validateQuery(adminAppointmentQuerySchema),
  asyncHandler(adminController.listAppointments),
);
