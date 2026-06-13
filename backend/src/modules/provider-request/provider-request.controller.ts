import type { Response } from "express";
import { successResponse } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { providerRequestService } from "./provider-request.service.js";

export class ProviderRequestController {
  submit = async (req: AuthRequest, res: Response) => {
    const result = await providerRequestService.submit(req.user!.sub, req.body);
    res.status(201).json(successResponse(result));
  };

  getMine = async (req: AuthRequest, res: Response) => {
    const result = await providerRequestService.getMine(req.user!.sub);
    res.json(successResponse(result));
  };
}

export const providerRequestController = new ProviderRequestController();
