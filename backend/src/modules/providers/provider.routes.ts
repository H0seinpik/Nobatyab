import { Router } from "express";
import { z } from "zod";
import { publicProviderController } from "./provider.controller.js";
import { validateParams, validateQuery, asyncHandler } from "../../shared/middlewares/errorHandler.js";

const providerQuerySchema = z.object({
  serviceId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const providerIdSchema = z.object({ id: z.string().cuid() });

const providerSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  providerServiceId: z.string().cuid(),
});

export const providerRoutes = Router();

providerRoutes.get("/", validateQuery(providerQuerySchema), asyncHandler(publicProviderController.list));
providerRoutes.get(
  "/:id/slots",
  validateParams(providerIdSchema),
  validateQuery(providerSlotsQuerySchema),
  asyncHandler(publicProviderController.getSlots),
);
providerRoutes.get("/:id", validateParams(providerIdSchema), asyncHandler(publicProviderController.getById));
