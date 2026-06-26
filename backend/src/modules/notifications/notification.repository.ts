import {
  NotificationRecipientRole,
  NotificationStatus,
  NotificationType,
  Prisma,
  Role,
} from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { NotificationCategory, NotificationStatusFilter } from "./notification.helpers.js";
import { getStatusForType, getTypesForCategory } from "./notification.helpers.js";

export type NotificationCreateData = {
  userId: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  status?: NotificationStatus;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export type NotificationWithUser = {
  id: string;
  userId: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  actionUrl: string | null;
  readAt: Date | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
  user: { role: Role };
};

const notificationInclude = {
  user: { select: { role: true } },
} as const;

function buildRecipientWhere(
  userId: string,
  recipientRole: NotificationRecipientRole,
  filters: {
    unreadOnly?: boolean;
    category?: NotificationCategory;
    filter?: NotificationStatusFilter;
  },
): Prisma.NotificationWhereInput {
  const where: Prisma.NotificationWhereInput = { userId, recipientRole };

  if (filters.filter === "unread" || filters.unreadOnly) {
    where.readAt = null;
  } else if (filters.filter === "confirmed") {
    where.status = NotificationStatus.CONFIRMED;
  } else if (filters.filter === "cancelled") {
    where.status = NotificationStatus.CANCELLED;
  } else if (filters.filter === "pending") {
    where.status = NotificationStatus.PENDING;
  } else if (filters.filter === "completed") {
    where.status = NotificationStatus.COMPLETED;
  }

  if (filters.category) {
    where.type = { in: getTypesForCategory(filters.category) };
  }

  return where;
}

export class NotificationRepository {
  create(data: NotificationCreateData) {
    return prisma.notification.create({
      data: {
        ...data,
        status: data.status ?? getStatusForType(data.type),
      },
      include: notificationInclude,
    });
  }

  createMany(data: NotificationCreateData[]) {
    if (data.length === 0) return Promise.resolve({ count: 0 });
    return prisma.notification.createMany({
      data: data.map((row) => ({
        ...row,
        status: row.status ?? getStatusForType(row.type),
      })),
    });
  }

  findByRecipient(
    userId: string,
    recipientRole: NotificationRecipientRole,
    filters: {
      unreadOnly?: boolean;
      category?: NotificationCategory;
      filter?: NotificationStatusFilter;
      skip?: number;
      take?: number;
    },
  ) {
    const where = buildRecipientWhere(userId, recipientRole, filters);

    return Promise.all([
      prisma.notification.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: notificationInclude,
      }),
      prisma.notification.count({ where }),
    ]);
  }

  countUnread(userId: string, recipientRole: NotificationRecipientRole) {
    return prisma.notification.count({
      where: { userId, recipientRole, readAt: null },
    });
  }

  countByRecipientGrouped(userId: string, recipientRole: NotificationRecipientRole) {
    const baseWhere = { userId, recipientRole };
    return Promise.all([
      prisma.notification.count({ where: baseWhere }),
      prisma.notification.count({ where: { ...baseWhere, readAt: null } }),
      prisma.notification.count({
        where: { ...baseWhere, status: NotificationStatus.CONFIRMED },
      }),
      prisma.notification.count({
        where: { ...baseWhere, status: NotificationStatus.CANCELLED },
      }),
      prisma.notification.count({
        where: { ...baseWhere, status: NotificationStatus.PENDING },
      }),
      prisma.notification.count({
        where: { ...baseWhere, status: NotificationStatus.COMPLETED },
      }),
    ]).then(([all, unread, confirmed, cancelled, pending, completed]) => ({
      all,
      unread,
      confirmed,
      cancelled,
      pending,
      completed,
    }));
  }

  findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
      include: notificationInclude,
    });
  }

  findUserRole(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
  }

  markRead(id: string, userId: string, recipientRole: NotificationRecipientRole) {
    return prisma.notification.updateMany({
      where: { id, userId, recipientRole, readAt: null },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string, recipientRole: NotificationRecipientRole) {
    return prisma.notification.updateMany({
      where: { userId, recipientRole, readAt: null },
      data: { readAt: new Date() },
    });
  }

  findAllAdminUserIds() {
    return prisma.user.findMany({
      where: { role: Role.ADMIN, isActive: true },
      select: { id: true },
    });
  }

  findProviderUserId(providerProfileId: string) {
    return prisma.providerProfile.findUnique({
      where: { id: providerProfileId },
      select: { userId: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
