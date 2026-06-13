import { Router } from "express";
import { Role } from "@prisma/client";
import { providerRequestController } from "./provider-request.controller.js";
import { submitProviderRequestSchema } from "./provider-request.schema.js";
import { asyncHandler, validateBody } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const providerRequestRoutes = Router();

providerRequestRoutes.use(requireAuth);

providerRequestRoutes.post(
  "/",
  requireRole(Role.USER),
  validateBody(submitProviderRequestSchema),
  asyncHandler(providerRequestController.submit),
);

providerRequestRoutes.get("/me", asyncHandler(providerRequestController.getMine));
