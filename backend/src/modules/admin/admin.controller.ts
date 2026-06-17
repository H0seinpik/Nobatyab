import type { Response } from "express";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";
import { adminService } from "./admin.service.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class AdminController {
  listUsers = async (req: QueryRequest, res: Response) => {
    const q = (req as QueryRequest & { validatedQuery: import("../../shared/schemas/listQuery.schema.js").BaseListQuery }).validatedQuery;
    const result = await adminService.listUsers(q);
    res.json(successResponse(result.items, result.meta));
  };

  getUser = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await adminService.getUser(getParam(req.params.id))));
  };

  createUser = async (req: AuthRequest, res: Response) => {
    res.status(201).json(successResponse(await adminService.createUser(req.body)));
  };

  updateUser = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await adminService.updateUser(getParam(req.params.id), req.body)));
  };

  listServiceRequests = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await adminService.listServiceRequests(
      q as Record<string, string | undefined> & { status?: import("@prisma/client").ServiceRequestStatus },
    );
    res.json(successResponse(result.items, result.meta));
  };

  listProviderRequests = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await adminService.listProviderRequests(
      q as Record<string, string | undefined> & { status?: import("@prisma/client").ProviderRequestStatus },
    );
    res.json(successResponse(result.items, result.meta));
  };

  reviewServiceRequest = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await adminService.reviewServiceRequest(getParam(req.params.id), req.body)));
  };

  listAppointments = async (req: QueryRequest, res: Response) => {
    const q = (req as QueryRequest & { validatedQuery: import("../../shared/schemas/listQuery.schema.js").BaseListQuery }).validatedQuery;
    const result = await adminService.listAppointments(q);
    res.json(successResponse(result.items, result.meta));
  };
}

export const adminController = new AdminController();
