import { Router } from "express";
import { Role } from "@prisma/client";
import { userAvailabilityController } from "./user-availability.controller.js";
import { replaceAvailabilitySchema, availabilityIdSchema } from "./user-availability.schema.js";
import { asyncHandler, validateBody, validateParams } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, requireRole } from "../../shared/middlewares/auth.js";

export const userAvailabilityRoutes = Router();

userAvailabilityRoutes.use(requireAuth, requireRole(Role.USER));

userAvailabilityRoutes.get("/", asyncHandler(userAvailabilityController.get));
userAvailabilityRoutes.put(
  "/",
  validateBody(replaceAvailabilitySchema),
  asyncHandler(userAvailabilityController.replace),
);
userAvailabilityRoutes.delete(
  "/:id",
  validateParams(availabilityIdSchema),
  asyncHandler(userAvailabilityController.deleteOne),
);
