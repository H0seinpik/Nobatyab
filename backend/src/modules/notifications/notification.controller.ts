import type { Response } from "express";
import { successResponse } from "../../shared/utils/apiError.js";
import { getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { notificationService } from "./notification.service.js";
import type { NotificationListQuery } from "./notification.schema.js";

type QueryRequest = AuthRequest & {
  validatedQuery?: Record<string, string | boolean | undefined>;
};

function authContext(req: AuthRequest) {
  return { userId: req.user!.sub, role: req.user!.role };
}

export class NotificationController {
  list = async (req: QueryRequest, res: Response) => {
    const q = (req.validatedQuery ?? req.query) as NotificationListQuery;
    const result = await notificationService.list(authContext(req), q);
    res.json(successResponse(result.items, result.meta));
  };

  unreadCount = async (req: AuthRequest, res: Response) => {
    const result = await notificationService.getUnreadCount(authContext(req));
    res.json(successResponse(result));
  };

  counts = async (req: AuthRequest, res: Response) => {
    const result = await notificationService.getCounts(authContext(req));
    res.json(successResponse(result));
  };

  markAsRead = async (req: AuthRequest, res: Response) => {
    const result = await notificationService.markAsRead(
      authContext(req),
      getParam(req.params.id),
    );
    res.json(successResponse(result));
  };

  markAllAsRead = async (req: AuthRequest, res: Response) => {
    const result = await notificationService.markAllAsRead(authContext(req));
    res.json(successResponse(result));
  };
}

export const notificationController = new NotificationController();
