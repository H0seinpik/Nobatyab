import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./auth.schema.js";
import { validateBody } from "../../shared/middlewares/errorHandler.js";
import { requireAuth, optionalAuth } from "../../shared/middlewares/auth.js";
import { asyncHandler } from "../../shared/middlewares/errorHandler.js";

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, error: { code: "RATE_LIMIT", message: "Too many attempts" } } });

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, validateBody(registerSchema), asyncHandler(authController.register));
authRoutes.post("/login", authLimiter, validateBody(loginSchema), asyncHandler(authController.login));
authRoutes.post("/refresh", validateBody(refreshSchema), asyncHandler(authController.refresh));
authRoutes.post("/logout", optionalAuth, asyncHandler(authController.logout));
authRoutes.get("/me", requireAuth, asyncHandler(authController.me));
authRoutes.patch(
  "/me",
  requireAuth,
  validateBody(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);
authRoutes.patch(
  "/password",
  requireAuth,
  validateBody(changePasswordSchema),
  asyncHandler(authController.changePassword),
);
authRoutes.post("/forgot-password", authLimiter, validateBody(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
authRoutes.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(authController.resetPassword));
