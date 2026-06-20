import type { Response } from "express";
import type { Request } from "express";
import { successResponse } from "../../shared/utils/apiError.js";
import { publicService } from "./public.service.js";

export class PublicController {
  stats = async (_req: Request, res: Response) => {
    res.json(successResponse(await publicService.getStats()));
  };
}

export const publicController = new PublicController();
