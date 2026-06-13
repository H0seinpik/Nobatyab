import { AppointmentStatus } from "@prisma/client";
import { authService } from "../auth/auth.service.js";
import { appointmentService } from "../appointments/appointment.service.js";
import type { ChangePasswordInput } from "./user.schema.js";

const COMPLETED_STATUSES = new Set<AppointmentStatus>([
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
]);

export class UserService {
  async getProfile(userId: string) {
    const user = await authService.me(userId);
    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      image: user.avatarUrl,
      email: user.email,
    };
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
