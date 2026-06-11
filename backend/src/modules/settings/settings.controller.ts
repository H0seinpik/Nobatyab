import type { Response } from "express";
import { successResponse } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { settingsService } from "./settings.service.js";

export class SettingsController {
  listAdmin = async (_req: AuthRequest, res: Response) => {
    res.json(successResponse(await settingsService.listAdmin()));
  };

  updateBulk = async (req: AuthRequest, res: Response) => {
    const settings = await settingsService.updateBulk(req.body);
    res.json(successResponse(settings));
  };

  getPublic = async (_req: AuthRequest, res: Response) => {
    res.json(successResponse(await settingsService.getPublic()));
  };
}

export const settingsController = new SettingsController();
