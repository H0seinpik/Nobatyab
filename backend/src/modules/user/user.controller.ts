import type { Response } from "express";
import { successResponse } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { userService } from "./user.service.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class UserController {
  getProfile = async (req: AuthRequest, res: Response) => {
    const profile = await userService.getProfile(req.user!.sub);
    res.json(successResponse(profile));
  };

  updateProfile = async (req: AuthRequest, res: Response) => {
    const profile = await userService.updateProfile(req.user!.sub, req.body);
    res.json(successResponse(profile));
  };

  getAppointments = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await userService.getAppointments(
      req.user!.sub,
      q as Record<string, string | undefined>,
    );
    res.json(successResponse(result));
  };

  changePassword = async (req: AuthRequest, res: Response) => {
    const result = await userService.changePassword(req.user!.sub, req.body);
    res.json(successResponse(result));
  };
}

export const userController = new UserController();
