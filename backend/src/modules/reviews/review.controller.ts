import type { Response } from "express";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { reviewService } from "./review.service.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class ReviewController {
  create = async (req: AuthRequest, res: Response) => {
    const review = await reviewService.createReview(
      req.user!.sub,
      getParam(req.params.id),
      req.body,
    );
    res.status(201).json(successResponse(review));
  };

  listByProvider = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await reviewService.listProviderReviews(getParam(req.params.id), q);
    res.json(successResponse(result.items, result.meta));
  };

  getSummary = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await reviewService.getRatingSummary(getParam(req.params.id))));
  };
}

export const reviewController = new ReviewController();
