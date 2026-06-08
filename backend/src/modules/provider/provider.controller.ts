import type { Response } from "express";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { providerService } from "./provider.service.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class ProviderController {
  getProfile = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await providerService.getProfile(req.user!.sub)));
  };

  updateProfile = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await providerService.updateProfile(req.user!.sub, req.body)));
  };

  getWorkingHours = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await providerService.getWorkingHours(req.user!.sub)));
  };

  replaceWorkingHours = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await providerService.replaceWorkingHours(req.user!.sub, req.body)));
  };

  getCancellationPolicy = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await providerService.getCancellationPolicy(req.user!.sub)));
  };

  updateCancellationPolicy = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await providerService.updateCancellationPolicy(req.user!.sub, req.body)));
  };

  createServiceRequest = async (req: AuthRequest, res: Response) => {
    res
      .status(201)
      .json(successResponse(await providerService.createServiceRequest(req.user!.sub, req.body)));
  };

  listServiceRequests = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await providerService.listServiceRequests(
      req.user!.sub,
      q as Record<string, string | undefined>,
    );
    res.json(successResponse(result.items, result.meta));
  };

  listAppointments = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await providerService.listAppointments(
      req.user!.sub,
      q as Record<string, string | undefined>,
    );
    res.json(successResponse(result.items, result.meta));
  };

  confirmAppointment = async (req: AuthRequest, res: Response) => {
    res.json(
      successResponse(await providerService.confirmAppointment(req.user!.sub, getParam(req.params.id))),
    );
  };

  completeAppointment = async (req: AuthRequest, res: Response) => {
    res.json(
      successResponse(await providerService.completeAppointment(req.user!.sub, getParam(req.params.id))),
    );
  };
}

export const providerController = new ProviderController();
