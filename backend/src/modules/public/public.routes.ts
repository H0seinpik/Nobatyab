import { Router } from "express";
import { asyncHandler } from "../../shared/middlewares/errorHandler.js";
import { publicController } from "./public.controller.js";

export const publicRoutes = Router();
publicRoutes.get("/stats", asyncHandler(publicController.stats));
