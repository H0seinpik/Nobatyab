import { Router } from "express";
import { Role } from "@prisma/client";
import { appointmentController } from "./appointment.controller.js";
import {
  appointmentIdSchema,
  bookAppointmentSchema,
  cancelAppointmentSchema,
  myAppointmentsQuerySchema,
} from "./appointment.schema.js";
import {
  validateBody,
  validateParams,
  validateQuery,
  asyncHandler,
} from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole, optionalAuth } from "../../shared/middlewares/auth.js";

export const appointmentRoutes = Router();

appointmentRoutes.post(
  "/",
  optionalAuth,
  validateBody(bookAppointmentSchema),
  asyncHandler(appointmentController.book),
);
appointmentRoutes.get(
  "/my",
  requireAuth,
  requireRole(Role.USER),
  validateQuery(myAppointmentsQuerySchema),
  asyncHandler(appointmentController.getMy),
);
appointmentRoutes.get(
  "/:id",
  requireAuth,
  validateParams(appointmentIdSchema),
  asyncHandler(appointmentController.getById),
);
appointmentRoutes.post(
  "/:id/cancel",
  requireAuth,
  validateParams(appointmentIdSchema),
  validateBody(cancelAppointmentSchema),
  asyncHandler(appointmentController.cancel),
);
appointmentRoutes.patch(
  "/:id/cancel",
  requireAuth,
  validateParams(appointmentIdSchema),
  validateBody(cancelAppointmentSchema),
  asyncHandler(appointmentController.cancel),
);
appointmentRoutes.post(
  "/:id/pay",
  requireAuth,
  requireRole(Role.USER),
  validateParams(appointmentIdSchema),
  asyncHandler(appointmentController.pay),
);
