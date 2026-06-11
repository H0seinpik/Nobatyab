import { prisma } from "../../config/database.js";
import type { Role } from "@prisma/client";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { providerProfile: true },
    });
  }

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { providerProfile: true },
    });
  }

  createUser(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
    role?: Role;
  }) {
    return prisma.user.create({
      data,
      include: { providerProfile: true },
    });
  }

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  updateUser(
    userId: string,
    data: { fullName?: string; email?: string },
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: { providerProfile: true },
    });
  }

  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  }

  revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  markPasswordResetUsed(id: string) {
    return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }
}

export const authRepository = new AuthRepository();
