import type { Response } from "express";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { publicProviderService } from "./provider.service.js";
import { slotService } from "../appointments/slot.service.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class PublicProviderController {
  list = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await publicProviderService.listPublic(q as Record<string, string | undefined>);
    res.json(successResponse(result.items, result.meta));
  };

  getById = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await publicProviderService.getById(getParam(req.params.id))));
  };

  getSlots = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const slots = await slotService.getAvailableSlots({
      providerId: getParam(req.params.id),
      providerServiceId: q.providerServiceId as string,
      date: q.date as string,
    });
    res.json(successResponse(slots));
  };

  getAvailableDays = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const dates = await slotService.getAvailableDays({
      providerId: getParam(req.params.id),
      providerServiceId: q.providerServiceId as string,
      from: q.from as string | undefined,
      horizonDays: q.horizonDays ? Number(q.horizonDays) : undefined,
    });
    res.json(successResponse({ dates }));
  };
}

export const publicProviderController = new PublicProviderController();
