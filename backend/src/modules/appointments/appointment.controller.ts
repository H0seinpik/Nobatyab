import type { Response } from "express";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { appointmentService } from "./appointment.service.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class AppointmentController {
  book = async (req: AuthRequest, res: Response) => {
    res.status(201).json(successResponse(await appointmentService.book(req.body, req.user)));
  };

  getMy = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await appointmentService.getMyAppointments(
      req.user!.sub,
      q as Record<string, string | undefined>,
    );
    res.json(successResponse(result.items, result.meta));
  };

  getById = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await appointmentService.getById(getParam(req.params.id), req.user)));
  };

  cancel = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await appointmentService.cancel(getParam(req.params.id), req.body, req.user!)));
  };

  pay = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await appointmentService.pay(getParam(req.params.id), req.user!)));
  };
}

export const appointmentController = new AppointmentController();
