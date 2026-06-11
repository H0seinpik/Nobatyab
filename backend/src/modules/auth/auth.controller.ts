import type { Response } from "express";
import { authService } from "./auth.service.js";
import { ApiError, successResponse } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";

export class AuthController {
  register = async (req: AuthRequest, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(successResponse(result));
  };

  login = async (req: AuthRequest, res: Response) => {
    const result = await authService.login(req.body);
    res.json(successResponse(result));
  };

  refresh = async (req: AuthRequest, res: Response) => {
    const token = req.body.refreshToken ?? req.cookies?.refreshToken;
    const result = await authService.refresh(token);
    res.json(successResponse(result));
  };

  logout = async (req: AuthRequest, res: Response) => {
    const token = req.body.refreshToken ?? req.cookies?.refreshToken;
    await authService.logout(token);
    res.json(successResponse({ message: "Logged out" }));
  };

  me = async (req: AuthRequest, res: Response) => {
    const user = await authService.me(req.user!.sub);
    res.json(successResponse(user));
  };

  updateProfile = async (req: AuthRequest, res: Response) => {
    const user = await authService.updateProfile(req.user!.sub, req.body);
    res.json(successResponse(user));
  };

  changePassword = async (req: AuthRequest, res: Response) => {
    const result = await authService.changePassword(req.user!.sub, req.body);
    res.json(successResponse(result));
  };

  uploadAvatar = async (req: AuthRequest, res: Response) => {
    const file = (req as AuthRequest & { file?: Express.Multer.File }).file;
    if (!file) throw ApiError.badRequest("No file uploaded");
    const user = await authService.uploadAvatar(req.user!.sub, file.filename);
    res.json(successResponse(user));
  };

  forgotPassword = async (req: AuthRequest, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    res.json(successResponse(result));
  };

  resetPassword = async (req: AuthRequest, res: Response) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    res.json(successResponse(result));
  };
}

export const authController = new AuthController();
