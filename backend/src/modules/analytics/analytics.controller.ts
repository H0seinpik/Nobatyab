import type { Response } from "express";
import { successResponse } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { analyticsService } from "./analytics.service.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class AnalyticsController {
  overview = async (_req: QueryRequest, res: Response) => {
    res.json(successResponse(await analyticsService.getOverview()));
  };

  trends = async (req: QueryRequest, res: Response) => {
    const months = req.query.months ? Number(req.query.months) : 6;
    res.json(successResponse(await analyticsService.getTrends(months)));
  };
}

export const analyticsController = new AnalyticsController();
