import { Router } from "express";
import {
  asyncHandler,
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middlewares/errorHandler.js";
import { requireAuth } from "../../shared/middlewares/auth.js";
import { reviewController } from "./review.controller.js";
import {
  appointmentIdParamSchema,
  createReviewSchema,
  providerIdParamSchema,
  providerReviewsQuerySchema,
} from "./review.schema.js";

export const reviewRoutes = Router();

reviewRoutes.post(
  "/appointments/:id/review",
  requireAuth,
  validateParams(appointmentIdParamSchema),
  validateBody(createReviewSchema),
  asyncHandler(reviewController.create),
);

reviewRoutes.get(
  "/providers/:id/reviews",
  validateParams(providerIdParamSchema),
  validateQuery(providerReviewsQuerySchema),
  asyncHandler(reviewController.listByProvider),
);

reviewRoutes.get(
  "/providers/:id/rating-summary",
  validateParams(providerIdParamSchema),
  asyncHandler(reviewController.getSummary),
);
