import { Router } from "express";
import type { ZodSchema } from "zod";
import { notificationController } from "./notification.controller.js";
import { notificationListQuerySchema, type NotificationListQuery } from "./notification.schema.js";
import { asyncHandler, validateQuery } from "../../shared/middlewares/errorHandler.js";
import { requireAuth } from "../../shared/middlewares/auth.js";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);

notificationRoutes.get(
  "/",
  validateQuery(notificationListQuerySchema as ZodSchema<NotificationListQuery>),
  asyncHandler(notificationController.list),
);

notificationRoutes.get("/unread-count", asyncHandler(notificationController.unreadCount));

notificationRoutes.get("/counts", asyncHandler(notificationController.counts));

notificationRoutes.post(
  "/mark-as-read/:id",
  asyncHandler(notificationController.markAsRead),
);

notificationRoutes.post("/mark-all-read", asyncHandler(notificationController.markAllAsRead));
