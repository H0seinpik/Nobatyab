import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NotificationStatus, NotificationType, Role } from "@prisma/client";
import {
  getCopyForType,
  getNotificationCategory,
  getStatusForType,
  getTypesForCategory,
  resolveActionUrl,
} from "./notification.helpers.js";

describe("notification.helpers", () => {
  it("maps booking types to booking category", () => {
    assert.equal(getNotificationCategory(NotificationType.APPOINTMENT_BOOKED), "booking");
    assert.equal(getNotificationCategory(NotificationType.NEW_APPOINTMENT_BOOKED), "booking");
  });

  it("maps payment types to payment category", () => {
    assert.equal(getNotificationCategory(NotificationType.PAYMENT_PENDING), "payment");
    assert.equal(getNotificationCategory(NotificationType.PAYMENT_COMPLETED), "payment");
  });

  it("maps request types to request category", () => {
    assert.equal(getNotificationCategory(NotificationType.NEW_PROVIDER_REQUEST), "request");
  });

  it("returns types for booking category filter", () => {
    const types = getTypesForCategory("booking");
    assert.ok(types.includes(NotificationType.APPOINTMENT_BOOKED));
    assert.ok(!types.includes(NotificationType.PAYMENT_COMPLETED));
  });

  it("returns Persian copy for appointment booked", () => {
    const copy = getCopyForType(NotificationType.APPOINTMENT_BOOKED);
    assert.equal(copy.message, "نوبت شما با موفقیت ثبت شد");
  });

  it("allows message overrides", () => {
    const copy = getCopyForType(NotificationType.NEW_APPOINTMENT_BOOKED, {
      message: "یک نوبت جدید در سیستم ثبت شد",
    });
    assert.equal(copy.message, "یک نوبت جدید در سیستم ثبت شد");
  });

  it("resolves user appointment URLs", () => {
    assert.equal(resolveActionUrl(Role.USER, NotificationType.APPOINTMENT_BOOKED), "/appointments");
    assert.equal(resolveActionUrl(Role.USER, NotificationType.PAYMENT_COMPLETED), "/appointments");
  });

  it("resolves provider appointment URLs", () => {
    assert.equal(
      resolveActionUrl(Role.PROVIDER, NotificationType.NEW_APPOINTMENT_BOOKED),
      "/provider/appointments",
    );
  });

  it("resolves admin URLs by type", () => {
    assert.equal(
      resolveActionUrl(Role.ADMIN, NotificationType.NEW_PROVIDER_REQUEST),
      "/admin/provider-requests",
    );
    assert.equal(
      resolveActionUrl(Role.ADMIN, NotificationType.NEW_SERVICE_REQUEST),
      "/admin/service-requests",
    );
    assert.equal(
      resolveActionUrl(Role.ADMIN, NotificationType.PAYMENT_COMPLETED),
      "/admin/appointments",
    );
  });

  it("maps notification types to status", () => {
    assert.equal(getStatusForType(NotificationType.APPOINTMENT_BOOKED), NotificationStatus.PENDING);
    assert.equal(getStatusForType(NotificationType.PAYMENT_PENDING), NotificationStatus.PENDING);
    assert.equal(
      getStatusForType(NotificationType.APPOINTMENT_CONFIRMED),
      NotificationStatus.CONFIRMED,
    );
    assert.equal(
      getStatusForType(NotificationType.APPOINTMENT_CANCELLED),
      NotificationStatus.CANCELLED,
    );
    assert.equal(
      getStatusForType(NotificationType.PAYMENT_COMPLETED),
      NotificationStatus.COMPLETED,
    );
    assert.equal(getStatusForType(NotificationType.PAYMENT_FAILED), NotificationStatus.PENDING);
  });
});
