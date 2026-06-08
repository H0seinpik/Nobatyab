import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { categoryRoutes, adminCategoryRoutes } from "./modules/categories/category.routes.js";
import { serviceRoutes, adminServiceRoutes } from "./modules/services/service.routes.js";
import { providerRoutes } from "./modules/providers/provider.routes.js";
import { appointmentRoutes } from "./modules/appointments/appointment.routes.js";
import { providerDashboardRoutes } from "./modules/provider/provider.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { errorHandler, notFoundHandler } from "./shared/middlewares/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(
    rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  const api = express.Router();
  api.use("/auth", authRoutes);
  api.use("/categories", categoryRoutes);
  api.use("/services", serviceRoutes);
  api.use("/providers", providerRoutes);
  api.use("/appointments", appointmentRoutes);
  api.use("/provider", providerDashboardRoutes);
  api.use("/admin", adminRoutes);
  api.use("/admin/categories", adminCategoryRoutes);
  api.use("/admin/services", adminServiceRoutes);

  app.use("/api/v1", api);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
