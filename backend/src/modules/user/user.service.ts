import { AppointmentStatus } from "@prisma/client";
import { ApiError } from "../../shared/utils/apiError.js";
import { authRepository } from "../auth/auth.repository.js";
import { authService } from "../auth/auth.service.js";
import { appointmentService } from "../appointments/appointment.service.js";
import type { ChangePasswordInput, UpdateUserProfileInput } from "./user.schema.js";

const COMPLETED_STATUSES = new Set<AppointmentStatus>([
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
]);

function mapUserProfile(user: {
  id: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  nationalCode: string | null;
  age: number | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    nationalCode: user.nationalCode,
    age: user.age,
    phone: user.phone,
    address: user.address,
    avatarUrl: user.avatarUrl,
    image: user.avatarUrl,
  };
}

export class UserService {
  async getProfile(userId: string) {
    const user = await authService.me(userId);
    return mapUserProfile(user);
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput) {
    const keys = Object.keys(input) as (keyof UpdateUserProfileInput)[];
    if (keys.length === 0) {
      throw ApiError.badRequest("No profile fields to update");
    }

    const current = await authRepository.findUserById(userId);
    if (!current) throw ApiError.notFound("User not found");

    if (input.email) {
      const existing = await authRepository.findUserByEmail(input.email);
      if (existing && existing.id !== userId) {
        throw ApiError.conflict("Email already in use");
      }
    }

    if (input.nationalCode) {
      const existing = await authRepository.findUserByNationalCode(input.nationalCode);
      if (existing && existing.id !== userId) {
        throw ApiError.conflict("National code already in use");
      }
    }

    const firstName = input.firstName ?? current.firstName;
    const lastName = input.lastName ?? current.lastName;
    const fullName =
      input.firstName !== undefined || input.lastName !== undefined
        ? [firstName, lastName].filter(Boolean).join(" ").trim() || current.fullName
        : undefined;

    const user = await authRepository.updateUser(userId, {
      ...(fullName ? { fullName } : {}),
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.nationalCode !== undefined ? { nationalCode: input.nationalCode || null } : {}),
      ...(input.age !== undefined ? { age: input.age } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
      ...(input.address !== undefined ? { address: input.address || null } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
    });

    return mapUserProfile(user);
  }

  async getAppointments(
    userId: string,
    query: { page?: string; limit?: string } = {},
  ) {
    const result = await appointmentService.getMyAppointments(userId, {
      ...query,
      limit: query.limit ?? "100",
    });

    const upcoming: typeof result.items = [];
    const completed: typeof result.items = [];

    for (const item of result.items) {
      if (COMPLETED_STATUSES.has(item.status)) {
        completed.push(item);
      } else {
        upcoming.push(item);
      }
    }

    return { upcoming, completed, meta: result.meta };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    return authService.changePassword(userId, input);
  }
}

export const userService = new UserService();
