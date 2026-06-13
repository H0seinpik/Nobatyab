import { Router } from "express";
import { userController } from "./user.controller.js";
import { userAppointmentsQuerySchema, changePasswordSchema } from "./user.schema.js";
import { asyncHandler, validateQuery, validateBody } from "../../shared/middlewares/errorHandler.js";
import { requireAuth } from "../../shared/middlewares/auth.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);

userRoutes.get("/profile", asyncHandler(userController.getProfile));
userRoutes.get(
  "/appointments",
  validateQuery(userAppointmentsQuerySchema),
  asyncHandler(userController.getAppointments),
);
userRoutes.post(
  "/change-password",
  validateBody(changePasswordSchema),
  asyncHandler(userController.changePassword),
);
