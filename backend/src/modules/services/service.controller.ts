import type { Response } from "express";
import { serviceCatalogService } from "./service.service.js";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";

type QueryRequest = AuthRequest & { validatedQuery?: Record<string, string | undefined> };

export class ServiceController {
  listPublic = async (req: QueryRequest, res: Response) => {
    const q = req.validatedQuery ?? req.query;
    const result = await serviceCatalogService.listPublic(q as Record<string, string | undefined>);
    res.json(successResponse(result.items, result.meta));
  };

  getById = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await serviceCatalogService.getById(getParam(req.params.id))));
  };

  listAdmin = async (req: QueryRequest, res: Response) => {
    const q = (req as QueryRequest & { validatedQuery: import("../../shared/schemas/listQuery.schema.js").BaseListQuery }).validatedQuery;
    const result = await serviceCatalogService.listAdmin(q);
    res.json(successResponse(result.items, result.meta));
  };

  create = async (req: AuthRequest, res: Response) => {
    res.status(201).json(successResponse(await serviceCatalogService.create(req.body)));
  };

  update = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await serviceCatalogService.update(getParam(req.params.id), req.body)));
  };

  remove = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await serviceCatalogService.remove(getParam(req.params.id))));
  };
}

export const serviceController = new ServiceController();
