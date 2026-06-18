import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import type { Role } from "@prisma/client";
import { authRepository } from "../../modules/auth/auth.repository.js";

export interface AuthRequest extends Request {
  user?: AccessTokenPayload;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized());
  }

  try {
    const token = header.slice(7);
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  try {
    req.user = verifyAccessToken(header.slice(7));
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    try {
      const dbUser = await authRepository.findUserById(req.user.sub);
      if (!dbUser || !dbUser.isActive) {
        return next(ApiError.unauthorized());
      }
      if (req.user.role !== dbUser.role) {
        return next(ApiError.tokenRoleStale());
      }
      if (!roles.includes(dbUser.role)) {
        return next(ApiError.forbidden());
      }
      req.user.role = dbUser.role;
      next();
    } catch {
      next(ApiError.internal());
    }
  };
}
