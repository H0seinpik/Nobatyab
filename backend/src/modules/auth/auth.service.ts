import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Role } from "@prisma/client";
import { env } from "../../config/env.js";
import { ApiError } from "../../shared/utils/apiError.js";
import {
  hashPassword,
  verifyPassword,
  hashOpaqueToken,
} from "../../shared/utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  parseExpiresInToMs,
} from "../../shared/utils/jwt.js";
import { authRepository } from "./auth.repository.js";
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "./auth.schema.js";

function sanitizeUser(user: {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  nationalCode?: string | null;
  age?: number | null;
  address?: string | null;
  phone: string | null;
  avatarUrl?: string | null;
  role: Role;
  isActive: boolean;
  providerProfile?: { id: string } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    nationalCode: user.nationalCode ?? null,
    age: user.age ?? null,
    address: user.address ?? null,
    phone: user.phone,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    isActive: user.isActive,
    providerProfileId: user.providerProfile?.id ?? null,
  };
}

function resolveAvatarFilePath(avatarUrl: string): string | null {
  if (!avatarUrl.startsWith("/uploads/")) return null;
  return path.join(env.upload.dir, avatarUrl.slice("/uploads/".length));
}

function deleteAvatarFile(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return;
  const filePath = resolveAvatarFilePath(avatarUrl);
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export class AuthService {
  private repo = authRepository;

  async register(input: RegisterInput) {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) throw ApiError.conflict("Email already registered");

    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: Role.USER,
    });

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  async login(input: LoginInput) {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    if (!user.isActive) throw ApiError.forbidden("Account is deactivated");

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const tokenHash = hashOpaqueToken(refreshToken);
    const stored = await this.repo.findRefreshTokenByHash(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized("Refresh token expired or revoked");
    }

    await this.repo.revokeRefreshToken(stored.id);

    const user = await this.repo.findUserById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized();

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    const tokenHash = hashOpaqueToken(refreshToken);
    const stored = await this.repo.findRefreshTokenByHash(tokenHash);
    if (stored && !stored.revokedAt) {
      await this.repo.revokeRefreshToken(stored.id);
    }
  }

  async me(userId: string, tokenRole?: Role) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw ApiError.notFound("User not found");
    return {
      ...sanitizeUser(user),
      tokenRoleStale: tokenRole !== undefined && tokenRole !== user.role,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.fullName === undefined && input.email === undefined && input.phone === undefined) {
      throw ApiError.badRequest("No profile fields to update");
    }

    if (input.email) {
      const existing = await this.repo.findUserByEmail(input.email);
      if (existing && existing.id !== userId) {
        throw ApiError.conflict("Email already in use");
      }
    }

    const user = await this.repo.updateUser(userId, input);
    return sanitizeUser(user);
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw ApiError.notFound("User not found");

    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Current password is incorrect");

    const passwordHash = await hashPassword(input.newPassword);
    await this.repo.updatePassword(userId, passwordHash);
    await this.repo.revokeAllUserTokens(userId);

    return { message: "Password changed successfully" };
  }

  async forgotPassword(email: string) {
    const user = await this.repo.findUserByEmail(email);
    if (!user) return { message: "If the email exists, a reset link was sent" };

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashOpaqueToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.repo.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetLink = `${env.app.url}/reset-password?token=${rawToken}`;
    console.log(`[PasswordReset] Link for ${email}: ${resetLink}`);

    return { message: "If the email exists, a reset link was sent" };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = hashOpaqueToken(token);
    const stored = await this.repo.findPasswordResetToken(tokenHash);

    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(password);
    await this.repo.updatePassword(stored.userId, passwordHash);
    await this.repo.markPasswordResetUsed(stored.id);
    await this.repo.revokeAllUserTokens(stored.userId);

    return { message: "Password reset successfully" };
  }

  async uploadAvatar(userId: string, filename: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw ApiError.notFound("User not found");

    const avatarUrl = `/uploads/avatars/${filename}`;
    deleteAvatarFile(user.avatarUrl);

    const updated = await this.repo.updateUser(userId, { avatarUrl });
    return sanitizeUser(updated);
  }

  private async issueTokens(user: { id: string; email: string; role: Role }) {
    const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken(user.id);
    const tokenHash = hashOpaqueToken(refreshToken);
    const expiresAt = new Date(Date.now() + parseExpiresInToMs(env.jwt.refreshExpiresIn));
    await this.repo.createRefreshToken(user.id, tokenHash, expiresAt);
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
