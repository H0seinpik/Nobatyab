import { NotificationRecipientRole, NotificationType, PaymentStatus, Role } from "@prisma/client";
import { ApiError, paginationMeta, parsePagination } from "../../shared/utils/apiError.js";
import {
  getCopyForType,
  getNotificationCategory,
  getStatusForType,
  resolveActionUrl,
  roleToRecipientRole,
  type NotificationCategory,
} from "./notification.helpers.js";
import {
  notificationRepository,
  type NotificationCreateData,
  type NotificationWithUser,
} from "./notification.repository.js";
import type { NotificationListQuery } from "./notification.schema.js";

type SortableNotification = { createdAt: Date | string; id: string };

export type NotificationAuthContext = {
  userId: string;
  role: Role;
};

export function sortNotificationsByNewest<T extends SortableNotification>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aTime =
      a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
    const bTime =
      b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
    const timeDiff = bTime - aTime;
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });
}

function toDto(notification: NotificationWithUser) {
  const actionUrl =
    notification.actionUrl ??
    resolveActionUrl(
      notification.recipientRole as unknown as Role,
      notification.type,
    );

  return {
    id: notification.id,
    title: notification.title,
    message: notification.body,
    type: notification.type,
    status: notification.status,
    recipientRole: notification.recipientRole,
    category: getNotificationCategory(notification.type),
    isRead: notification.readAt !== null,
    createdAt: notification.createdAt.toISOString(),
    entityType: notification.entityType ?? undefined,
    entityId: notification.entityId ?? undefined,
    actionUrl: actionUrl ?? undefined,
  };
}

function recipientRoleForAuth(auth: NotificationAuthContext) {
  return roleToRecipientRole(auth.role);
}

export class NotificationService {
  constructor(private repo = notificationRepository) {}

  async list(auth: NotificationAuthContext, query: NotificationListQuery) {
    const recipientRole = recipientRoleForAuth(auth);
    const { page, limit, skip } = parsePagination({
      page: query.page,
      limit: query.limit ?? query.pageSize ?? 10,
      pageSize: query.pageSize,
    });
    const [items, total] = await this.repo.findByRecipient(auth.userId, recipientRole, {
      unreadOnly: query.unreadOnly,
      category: query.category,
      filter: query.filter,
      skip,
      take: limit,
    });
    return {
      items: sortNotificationsByNewest(items.map((item) => toDto(item as NotificationWithUser))),
      meta: paginationMeta(page, limit, total),
    };
  }

  async getUnreadCount(auth: NotificationAuthContext) {
    const count = await this.repo.countUnread(auth.userId, recipientRoleForAuth(auth));
    return { count };
  }

  async getCounts(auth: NotificationAuthContext) {
    return this.repo.countByRecipientGrouped(auth.userId, recipientRoleForAuth(auth));
  }

  async markAsRead(auth: NotificationAuthContext, notificationId: string) {
    const recipientRole = recipientRoleForAuth(auth);
    const existing = await this.repo.findById(notificationId);
    if (!existing) throw ApiError.notFound("اعلان یافت نشد");
    if (existing.userId !== auth.userId || existing.recipientRole !== recipientRole) {
      throw ApiError.forbidden();
    }

    await this.repo.markRead(notificationId, auth.userId, recipientRole);
    const updated = await this.repo.findById(notificationId);
    return toDto(updated as NotificationWithUser);
  }

  async markAllAsRead(auth: NotificationAuthContext) {
    const result = await this.repo.markAllRead(auth.userId, recipientRoleForAuth(auth));
    return { updated: result.count };
  }

  async notifyUser(input: {
    userId: string;
    type: NotificationType;
    title?: string;
    message?: string;
    entityType?: string;
    entityId?: string;
    role?: Role;
  }) {
    const recipientRole = roleToRecipientRole(input.role ?? Role.USER);
    const copy = getCopyForType(input.type, {
      title: input.title,
      message: input.message,
    });
    const actionUrl = resolveActionUrl(input.role ?? Role.USER, input.type);
    return this.repo.create({
      userId: input.userId,
      recipientRole,
      type: input.type,
      status: getStatusForType(input.type),
      title: copy.title,
      body: copy.message,
      entityType: input.entityType,
      entityId: input.entityId,
      actionUrl,
    });
  }

  async notifyProviderByProfileId(input: {
    providerProfileId: string;
    type: NotificationType;
    title?: string;
    message?: string;
    entityType?: string;
    entityId?: string;
  }) {
    const provider = await this.repo.findProviderUserId(input.providerProfileId);
    if (!provider) return null;

    const copy = getCopyForType(input.type, {
      title: input.title,
      message: input.message,
    });
    const actionUrl = resolveActionUrl(Role.PROVIDER, input.type);
    return this.repo.create({
      userId: provider.userId,
      recipientRole: NotificationRecipientRole.PROVIDER,
      type: input.type,
      status: getStatusForType(input.type),
      title: copy.title,
      body: copy.message,
      entityType: input.entityType,
      entityId: input.entityId,
      actionUrl,
    });
  }

  async notifyAllAdmins(input: {
    type: NotificationType;
    title?: string;
    message?: string;
    entityType?: string;
    entityId?: string;
  }) {
    const admins = await this.repo.findAllAdminUserIds();
    if (admins.length === 0) return { count: 0 };

    const copy = getCopyForType(input.type, {
      title: input.title,
      message: input.message,
    });
    const actionUrl = resolveActionUrl(Role.ADMIN, input.type);

    const rows: NotificationCreateData[] = admins.map((admin) => ({
      userId: admin.id,
      recipientRole: NotificationRecipientRole.ADMIN,
      type: input.type,
      status: getStatusForType(input.type),
      title: copy.title,
      body: copy.message,
      entityType: input.entityType,
      entityId: input.entityId,
      actionUrl,
    }));

    const result = await this.repo.createMany(rows);
    return result;
  }

  async onAppointmentBooked(appointment: {
    id: string;
    userId: string | null;
    providerId: string;
    paymentStatus: PaymentStatus;
  }) {
    const entity = { entityType: "appointment", entityId: appointment.id };

    if (appointment.userId) {
      await this.notifyUser({
        userId: appointment.userId,
        type: NotificationType.APPOINTMENT_BOOKED,
        entityType: entity.entityType,
        entityId: entity.entityId,
        role: Role.USER,
      });

      if (appointment.paymentStatus === PaymentStatus.PENDING) {
        await this.notifyUser({
          userId: appointment.userId,
          type: NotificationType.PAYMENT_PENDING,
          entityType: entity.entityType,
          entityId: entity.entityId,
          role: Role.USER,
        });
      }
    }

    await this.notifyProviderByProfileId({
      providerProfileId: appointment.providerId,
      type: NotificationType.NEW_APPOINTMENT_BOOKED,
      message: "یک نوبت جدید برای شما ثبت شد",
      ...entity,
    });

    await this.notifyAllAdmins({
      type: NotificationType.NEW_APPOINTMENT_BOOKED,
      message: "یک نوبت جدید در سیستم ثبت شد",
      ...entity,
    });
  }

  async onAppointmentConfirmed(appointment: {
    id: string;
    userId: string | null;
  }) {
    if (!appointment.userId) return;
    await this.notifyUser({
      userId: appointment.userId,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      entityType: "appointment",
      entityId: appointment.id,
      role: Role.USER,
    });
  }

  async onAppointmentCancelled(appointment: {
    id: string;
    userId: string | null;
    providerId: string;
  }) {
    const entity = { entityType: "appointment", entityId: appointment.id };

    if (appointment.userId) {
      await this.notifyUser({
        userId: appointment.userId,
        type: NotificationType.APPOINTMENT_CANCELLED,
        ...entity,
        role: Role.USER,
      });
    }

    await this.notifyProviderByProfileId({
      providerProfileId: appointment.providerId,
      type: NotificationType.APPOINTMENT_CANCELLED_BY_USER,
      ...entity,
    });

    await this.notifyAllAdmins({
      type: NotificationType.APPOINTMENT_CANCELLED,
      message: "یک نوبت در سیستم لغو شد",
      ...entity,
    });
  }

  async onPaymentCompleted(appointment: {
    id: string;
    userId: string | null;
    providerId: string;
  }) {
    const entity = { entityType: "appointment", entityId: appointment.id };

    if (appointment.userId) {
      await this.notifyUser({
        userId: appointment.userId,
        type: NotificationType.PAYMENT_COMPLETED,
        ...entity,
        role: Role.USER,
      });
    }

    await this.notifyProviderByProfileId({
      providerProfileId: appointment.providerId,
      type: NotificationType.PAYMENT_COMPLETED,
      message: "پرداخت یک نوبت انجام شد",
      ...entity,
    });

    await this.notifyAllAdmins({
      type: NotificationType.PAYMENT_COMPLETED,
      message: "یک پرداخت جدید در سیستم ثبت شد",
      ...entity,
    });
  }

  async onProviderRequestSubmitted(request: { id: string }) {
    await this.notifyAllAdmins({
      type: NotificationType.NEW_PROVIDER_REQUEST,
      entityType: "providerRequest",
      entityId: request.id,
    });
  }
}

export const notificationService = new NotificationService();
