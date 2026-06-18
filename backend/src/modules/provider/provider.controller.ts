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
    res.json(
      successResponse(
        await providerService.getWorkingHours(
          req.user!.sub,
          getParam(req.params.providerServiceId),
        ),
      ),
    );
  };

  replaceWorkingHours = async (req: AuthRequest, res: Response) => {
    res.json(
      successResponse(
        await providerService.replaceWorkingHours(
          req.user!.sub,
          getParam(req.params.providerServiceId),
          req.body,
        ),
      ),
    );
  };

  createWorkingHour = async (req: AuthRequest, res: Response) => {
    res
      .status(201)
      .json(
        successResponse(
          await providerService.createWorkingHour(
            req.user!.sub,
            getParam(req.params.providerServiceId),
            req.body,
          ),
        ),
      );
  };

  deleteWorkingHour = async (req: AuthRequest, res: Response) => {
    const hours = await providerService.deleteWorkingHour(
      req.user!.sub,
      getParam(req.params.providerServiceId),
      getParam(req.params.id),
    );
    res.json(successResponse(hours));
  };

  toggleWorkingDay = async (req: AuthRequest, res: Response) => {
    const hours = await providerService.toggleWorkingDay(
      req.user!.sub,
      getParam(req.params.providerServiceId),
      getParam(req.params.id),
      req.body.isActive,
    );
    res.json(successResponse(hours));
  };

  updateWorkingHourStatus = async (req: AuthRequest, res: Response) => {
    const hours = await providerService.toggleWorkingDay(
      req.user!.sub,
      getParam(req.params.providerServiceId),
      getParam(req.params.id),
      req.body.isActive,
    );
    res.json(successResponse(hours));
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

  listProviderServices = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await providerService.listProviderServices(req.user!.sub)));
  };

  createProviderService = async (req: AuthRequest, res: Response) => {
    res
      .status(201)
      .json(successResponse(await providerService.createProviderService(req.user!.sub, req.body)));
  };

  updateProviderService = async (req: AuthRequest, res: Response) => {
    res.json(
      successResponse(
        await providerService.updateProviderService(req.user!.sub, getParam(req.params.id), req.body),
      ),
    );
  };

  deleteProviderService = async (req: AuthRequest, res: Response) => {
    res.json(
      successResponse(await providerService.deleteProviderService(req.user!.sub, getParam(req.params.id))),
    );
  };
}

export const providerController = new ProviderController();
