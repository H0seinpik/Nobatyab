import type { Response } from "express";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { userAvailabilityService } from "./user-availability.service.js";

export class UserAvailabilityController {
  get = async (req: AuthRequest, res: Response) => {
    const entries = await userAvailabilityService.getForUser(req.user!.sub);
    res.json(successResponse(entries));
  };

  replace = async (req: AuthRequest, res: Response) => {
    const entries = await userAvailabilityService.replaceForUser(req.user!.sub, req.body);
    res.json(successResponse(entries));
  };

  deleteOne = async (req: AuthRequest, res: Response) => {
    const entries = await userAvailabilityService.deleteForUser(
      req.user!.sub,
      getParam(req.params.id),
    );
    res.json(successResponse(entries));
  };
}

export const userAvailabilityController = new UserAvailabilityController();
