import { Router } from "express";
import { Role } from "@prisma/client";
import { serviceController } from "./service.controller.js";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  serviceIdSchema,
} from "./service.schema.js";
import { validateBody, validateParams, validateQuery, asyncHandler } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const serviceRoutes = Router();
serviceRoutes.get("/", validateQuery(serviceQuerySchema), asyncHandler(serviceController.listPublic));
serviceRoutes.get("/:id", validateParams(serviceIdSchema), asyncHandler(serviceController.getById));

export const adminServiceRoutes = Router();
adminServiceRoutes.use(requireAuth, requireRole(Role.ADMIN));
adminServiceRoutes.get("/", validateQuery(serviceQuerySchema), asyncHandler(serviceController.listAdmin));
adminServiceRoutes.post("/", validateBody(createServiceSchema), asyncHandler(serviceController.create));
adminServiceRoutes.patch("/:id", validateParams(serviceIdSchema), validateBody(updateServiceSchema), asyncHandler(serviceController.update));
adminServiceRoutes.delete("/:id", validateParams(serviceIdSchema), asyncHandler(serviceController.remove));
