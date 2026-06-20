import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncHandler } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";
import { analyticsController } from "./analytics.controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth, requireRole(Role.ADMIN));

analyticsRoutes.get("/overview", asyncHandler(analyticsController.overview));
analyticsRoutes.get("/trends", asyncHandler(analyticsController.trends));
