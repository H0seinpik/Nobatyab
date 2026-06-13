import type { Response } from "express";
import { successResponse } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { smartBookingService } from "./smart-booking.service.js";

export class SmartBookingController {
  suggest = async (req: AuthRequest, res: Response) => {
    const result = await smartBookingService.suggest(req.user!.sub, req.body);
    res.json(successResponse(result));
  };

  confirm = async (req: AuthRequest, res: Response) => {
    const result = await smartBookingService.confirm(req.user!.sub, req.body);
    const status = result.isReplay ? 200 : 201;
    res.status(status).json(successResponse(result.appointment));
  };
}

export const smartBookingController = new SmartBookingController();
