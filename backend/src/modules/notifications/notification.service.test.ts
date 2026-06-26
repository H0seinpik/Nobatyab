import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  NotificationRecipientRole,
  NotificationStatus,
  NotificationType,
  PaymentStatus,
  Role,
  type Notification,
} from "@prisma/client";
import {
  NotificationService,
  sortNotificationsByNewest,
  type NotificationAuthContext,
} from "./notification.service.js";
import type { NotificationRepository } from "./notification.repository.js";
import { getStatusForType, resolveActionUrl } from "./notification.helpers.js";
import type { NotificationStatusFilter } from "./notification.helpers.js";

type MockRow = Notification & { user: { role: Role } };

const userAuth: NotificationAuthContext = { userId: "user-1", role: Role.USER };
const providerAuth: NotificationAuthContext = { userId: "provider-user-1", role: Role.PROVIDER };
const adminAuth: NotificationAuthContext = { userId: "admin-1", role: Role.ADMIN };

function makeNotification(overrides: Partial<MockRow> = {}): MockRow {
  const type = overrides.type ?? NotificationType.APPOINTMENT_BOOKED;
  const recipientRole = overrides.recipientRole ?? NotificationRecipientRole.USER;
  const role = recipientRole as unknown as Role;
  return {
    id: "n1",
    userId: "user-1",
    recipientRole,
    type,
    status: overrides.status ?? getStatusForType(type),
    title: "ثبت نوبت",
    body: "نوبت شما با موفقیت ثبت شد",
    entityType: "appointment",
    entityId: "apt-1",
    actionUrl: resolveActionUrl(role, type),
    readAt: null,
    metadata: null,
    createdAt: new Date("2026-06-25T10:00:00.000Z"),
    user: { role },
    ...overrides,
  };
}

class MockNotificationRepository {
  notifications: MockRow[] = [];
  adminIds = [{ id: "admin-1" }, { id: "admin-2" }];
  providerUserIds = new Map<string, string>([["provider-1", "provider-user-1"]]);

  create = async (data: {
    userId: string;
    recipientRole: NotificationRecipientRole;
    type: NotificationType;
    status?: NotificationStatus;
    title: string;
    body: string;
    entityType?: string;
    entityId?: string;
    actionUrl?: string | null;
  }) => {
    const role = data.recipientRole as unknown as Role;
    const row = makeNotification({
      id: `n${this.notifications.length + 1}`,
      userId: data.userId,
      recipientRole: data.recipientRole,
      type: data.type,
      status: data.status ?? getStatusForType(data.type),
      title: data.title,
      body: data.body,
      entityType: data.entityType ?? null,
      entityId: data.entityId ?? null,
      actionUrl: data.actionUrl ?? resolveActionUrl(role, data.type),
      user: { role },
    });
    this.notifications.push(row);
    return row;
  };

  createMany = async (
    data: Array<{
      userId: string;
      recipientRole: NotificationRecipientRole;
      type: NotificationType;
      status?: NotificationStatus;
      title: string;
      body: string;
      entityType?: string;
      entityId?: string;
      actionUrl?: string | null;
    }>,
  ) => {
    for (const row of data) {
      await this.create(row);
    }
    return { count: data.length };
  };

  findByRecipient = async (
    userId: string,
    recipientRole: NotificationRecipientRole,
    filters: {
      unreadOnly?: boolean;
      category?: string;
      filter?: NotificationStatusFilter;
      skip?: number;
      take?: number;
    },
  ) => {
    let items = this.notifications.filter(
      (n) => n.userId === userId && n.recipientRole === recipientRole,
    );
    if (filters.filter === "unread" || filters.unreadOnly) {
      items = items.filter((n) => n.readAt === null);
    } else if (filters.filter === "confirmed") {
      items = items.filter((n) => n.status === NotificationStatus.CONFIRMED);
    } else if (filters.filter === "cancelled") {
      items = items.filter((n) => n.status === NotificationStatus.CANCELLED);
    } else if (filters.filter === "pending") {
      items = items.filter((n) => n.status === NotificationStatus.PENDING);
    } else if (filters.filter === "completed") {
      items = items.filter((n) => n.status === NotificationStatus.COMPLETED);
    }
    items = sortNotificationsByNewest(items);
    const total = items.length;
    const skip = filters.skip ?? 0;
    const take = filters.take ?? 20;
    return [items.slice(skip, skip + take), total] as [MockRow[], number];
  };

  countUnread = async (userId: string, recipientRole: NotificationRecipientRole) =>
    this.notifications.filter(
      (n) => n.userId === userId && n.recipientRole === recipientRole && n.readAt === null,
    ).length;

  countByRecipientGrouped = async (userId: string, recipientRole: NotificationRecipientRole) => {
    const items = this.notifications.filter(
      (n) => n.userId === userId && n.recipientRole === recipientRole,
    );
    return {
      all: items.length,
      unread: items.filter((n) => n.readAt === null).length,
      confirmed: items.filter((n) => n.status === NotificationStatus.CONFIRMED).length,
      cancelled: items.filter((n) => n.status === NotificationStatus.CANCELLED).length,
      pending: items.filter((n) => n.status === NotificationStatus.PENDING).length,
      completed: items.filter((n) => n.status === NotificationStatus.COMPLETED).length,
    };
  };

  findById = async (id: string) => this.notifications.find((n) => n.id === id) ?? null;

  markRead = async (id: string, userId: string, recipientRole: NotificationRecipientRole) => {
    const row = this.notifications.find(
      (n) => n.id === id && n.userId === userId && n.recipientRole === recipientRole,
    );
    if (row && !row.readAt) row.readAt = new Date();
    return { count: row ? 1 : 0 };
  };

  markAllRead = async (userId: string, recipientRole: NotificationRecipientRole) => {
    let count = 0;
    for (const row of this.notifications) {
      if (row.userId === userId && row.recipientRole === recipientRole && !row.readAt) {
        row.readAt = new Date();
        count += 1;
      }
    }
    return { count };
  };

  findAllAdminUserIds = async () => this.adminIds;

  findProviderUserId = async (providerProfileId: string) => {
    const userId = this.providerUserIds.get(providerProfileId);
    return userId ? { userId } : null;
  };
}

describe("NotificationService", () => {
  let repo: MockNotificationRepository;
  let service: NotificationService;

  beforeEach(() => {
    repo = new MockNotificationRepository();
    service = new NotificationService(repo as unknown as NotificationRepository);
  });

  it("notifyUser creates unread notification with recipientRole USER", async () => {
    const created = await service.notifyUser({
      userId: "user-1",
      type: NotificationType.APPOINTMENT_BOOKED,
      entityType: "appointment",
      entityId: "apt-1",
      role: Role.USER,
    });

    assert.equal(created.userId, "user-1");
    assert.equal(created.recipientRole, NotificationRecipientRole.USER);
    assert.equal(created.readAt, null);
    assert.equal(created.status, NotificationStatus.PENDING);
  });

  it("notifyProviderByProfileId sets recipientRole PROVIDER", async () => {
    const created = await service.notifyProviderByProfileId({
      providerProfileId: "provider-1",
      type: NotificationType.NEW_APPOINTMENT_BOOKED,
    });
    assert.equal(created?.userId, "provider-user-1");
    assert.equal(created?.recipientRole, NotificationRecipientRole.PROVIDER);
  });

  it("getUnreadCount returns correct count for auth role", async () => {
    await service.notifyUser({ userId: "user-1", type: NotificationType.APPOINTMENT_BOOKED, role: Role.USER });
    await service.notifyUser({ userId: "user-1", type: NotificationType.PAYMENT_PENDING, role: Role.USER });
    const { count } = await service.getUnreadCount(userAuth);
    assert.equal(count, 2);
  });

  it("getCounts returns grouped totals including completed", async () => {
    repo.notifications.push(
      makeNotification({
        id: "n1",
        userId: "user-1",
        recipientRole: NotificationRecipientRole.USER,
        status: NotificationStatus.PENDING,
      }),
      makeNotification({
        id: "n2",
        userId: "user-1",
        recipientRole: NotificationRecipientRole.USER,
        type: NotificationType.APPOINTMENT_CONFIRMED,
        status: NotificationStatus.CONFIRMED,
        readAt: new Date(),
      }),
      makeNotification({
        id: "n3",
        userId: "user-1",
        recipientRole: NotificationRecipientRole.USER,
        type: NotificationType.PAYMENT_COMPLETED,
        status: NotificationStatus.COMPLETED,
      }),
    );

    const counts = await service.getCounts(userAuth);
    assert.equal(counts.all, 3);
    assert.equal(counts.unread, 2);
    assert.equal(counts.confirmed, 1);
    assert.equal(counts.completed, 1);
    assert.equal(counts.pending, 1);
  });

  it("list scopes to recipientRole for provider auth", async () => {
    repo.notifications.push(
      makeNotification({
        id: "n-user",
        userId: "provider-user-1",
        recipientRole: NotificationRecipientRole.USER,
        type: NotificationType.APPOINTMENT_BOOKED,
      }),
      makeNotification({
        id: "n-provider",
        userId: "provider-user-1",
        recipientRole: NotificationRecipientRole.PROVIDER,
        type: NotificationType.NEW_APPOINTMENT_BOOKED,
      }),
    );

    const result = await service.list(providerAuth, {});
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "n-provider");
  });

  it("list scopes to recipientRole for admin auth", async () => {
    repo.notifications.push(
      makeNotification({
        id: "n-admin",
        userId: "admin-1",
        recipientRole: NotificationRecipientRole.ADMIN,
        type: NotificationType.NEW_PROVIDER_REQUEST,
      }),
      makeNotification({
        id: "n-user",
        userId: "admin-1",
        recipientRole: NotificationRecipientRole.USER,
        type: NotificationType.APPOINTMENT_BOOKED,
      }),
    );

    const result = await service.list(adminAuth, {});
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "n-admin");
  });

  it("list with filter=completed returns only completed status", async () => {
    repo.notifications.push(
      makeNotification({
        id: "n1",
        userId: "user-1",
        recipientRole: NotificationRecipientRole.USER,
        status: NotificationStatus.PENDING,
      }),
      makeNotification({
        id: "n2",
        userId: "user-1",
        recipientRole: NotificationRecipientRole.USER,
        type: NotificationType.PAYMENT_COMPLETED,
        status: NotificationStatus.COMPLETED,
      }),
    );

    const result = await service.list(userAuth, { filter: "completed" });
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "n2");
  });

  it("list with filter=unread returns only unread rows", async () => {
    repo.notifications.push(
      makeNotification({
        id: "n1",
        userId: "user-1",
        recipientRole: NotificationRecipientRole.USER,
        readAt: null,
      }),
      makeNotification({
        id: "n2",
        userId: "user-1",
        recipientRole: NotificationRecipientRole.USER,
        readAt: new Date(),
        type: NotificationType.APPOINTMENT_CONFIRMED,
        status: NotificationStatus.CONFIRMED,
      }),
    );

    const result = await service.list(userAuth, { filter: "unread" });
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0].id, "n1");
  });

  it("markAsRead forbids wrong recipientRole", async () => {
    repo.notifications.push(
      makeNotification({
        id: "n1",
        userId: "provider-user-1",
        recipientRole: NotificationRecipientRole.PROVIDER,
      }),
    );
    await assert.rejects(
      () => service.markAsRead(userAuth, "n1"),
      (err: Error) => err.message.includes("Forbidden") || (err as { statusCode?: number }).statusCode === 403,
    );
  });

  it("markAsRead excludes item from unread-filtered list", async () => {
    const created = await service.notifyUser({
      userId: "user-1",
      type: NotificationType.APPOINTMENT_BOOKED,
      role: Role.USER,
    });
    await service.markAsRead(userAuth, created.id);
    const unreadList = await service.list(userAuth, { filter: "unread" });
    assert.equal(unreadList.items.length, 0);
  });

  it("onAppointmentBooked creates rows with correct recipientRole per audience", async () => {
    await service.onAppointmentBooked({
      id: "apt-1",
      userId: "user-1",
      providerId: "provider-1",
      paymentStatus: PaymentStatus.PENDING,
    });

    const userRows = repo.notifications.filter(
      (n) => n.userId === "user-1" && n.recipientRole === NotificationRecipientRole.USER,
    );
    assert.equal(userRows.length, 2);

    const providerRow = repo.notifications.find(
      (n) =>
        n.userId === "provider-user-1" &&
        n.recipientRole === NotificationRecipientRole.PROVIDER &&
        n.type === NotificationType.NEW_APPOINTMENT_BOOKED,
    );
    assert.ok(providerRow);

    const adminRows = repo.notifications.filter(
      (n) => n.recipientRole === NotificationRecipientRole.ADMIN,
    );
    assert.equal(adminRows.length, 2);
  });

  it("onProviderRequestSubmitted notifies admins with ADMIN recipientRole", async () => {
    await service.onProviderRequestSubmitted({ id: "req-1" });
    const adminNotifications = repo.notifications.filter(
      (n) => n.type === NotificationType.NEW_PROVIDER_REQUEST,
    );
    assert.equal(adminNotifications.length, 2);
    assert.equal(adminNotifications[0]?.recipientRole, NotificationRecipientRole.ADMIN);
    assert.equal(adminNotifications[0]?.actionUrl, "/admin/provider-requests");
  });
});
