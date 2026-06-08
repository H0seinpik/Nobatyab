import { Router } from "express";
import { Role } from "@prisma/client";
import { categoryController } from "./category.controller.js";
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from "./category.schema.js";
import { validateBody, validateParams, asyncHandler } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const categoryRoutes = Router();
categoryRoutes.get("/", asyncHandler(categoryController.listPublic));

export const adminCategoryRoutes = Router();
adminCategoryRoutes.use(requireAuth, requireRole(Role.ADMIN));
adminCategoryRoutes.get("/", asyncHandler(categoryController.listAdmin));
adminCategoryRoutes.post("/", validateBody(createCategorySchema), asyncHandler(categoryController.create));
adminCategoryRoutes.patch("/:id", validateParams(categoryIdSchema), validateBody(updateCategorySchema), asyncHandler(categoryController.update));
adminCategoryRoutes.delete("/:id", validateParams(categoryIdSchema), asyncHandler(categoryController.remove));
