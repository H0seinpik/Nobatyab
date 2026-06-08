import type { Response } from "express";
import { categoryService } from "./category.service.js";
import { successResponse, getParam } from "../../shared/utils/apiError.js";
import type { AuthRequest } from "../../shared/middlewares/auth.js";

export class CategoryController {
  listPublic = async (_req: AuthRequest, res: Response) => {
    res.json(successResponse(await categoryService.listPublic()));
  };

  listAdmin = async (_req: AuthRequest, res: Response) => {
    res.json(successResponse(await categoryService.listAdmin()));
  };

  create = async (req: AuthRequest, res: Response) => {
    res.status(201).json(successResponse(await categoryService.create(req.body)));
  };

  update = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await categoryService.update(getParam(req.params.id), req.body)));
  };

  remove = async (req: AuthRequest, res: Response) => {
    res.json(successResponse(await categoryService.remove(getParam(req.params.id))));
  };
}

export const categoryController = new CategoryController();
