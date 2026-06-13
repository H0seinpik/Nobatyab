import { Router } from "express";
import { Role } from "@prisma/client";
import { smartBookingController } from "./smart-booking.controller.js";
import { confirmBookingSchema, suggestBookingSchema } from "./smart-booking.schema.js";
import { asyncHandler, validateBody } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const smartBookingRoutes = Router();

smartBookingRoutes.post(
  "/suggest",
  requireAuth,
  requireRole(Role.USER),
  validateBody(suggestBookingSchema),
  asyncHandler(smartBookingController.suggest),
);

export const confirmBookingRoutes = Router();

confirmBookingRoutes.post(
  "/",
  requireAuth,
  requireRole(Role.USER),
  validateBody(confirmBookingSchema),
  asyncHandler(smartBookingController.confirm),
);
