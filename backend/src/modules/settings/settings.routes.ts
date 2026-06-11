import { Router } from "express";
import { Role } from "@prisma/client";
import { settingsController } from "./settings.controller.js";
import { updateSettingsSchema } from "./settings.schema.js";
import { validateBody, asyncHandler } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const settingsRoutes = Router();
settingsRoutes.get("/public", asyncHandler(settingsController.getPublic));

export const adminSettingsRoutes = Router();
adminSettingsRoutes.use(requireAuth, requireRole(Role.ADMIN));
adminSettingsRoutes.get("/", asyncHandler(settingsController.listAdmin));
adminSettingsRoutes.patch("/", validateBody(updateSettingsSchema), asyncHandler(settingsController.updateBulk));
