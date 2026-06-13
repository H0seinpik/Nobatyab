import { createHash } from "node:crypto";

export function buildSmartBookingRequestKey(
  userId: string,
  input: {
    providerId: string;
    providerServiceId: string;
    timeSlotIds: string[];
  },
): string {
  const slotIds = [...input.timeSlotIds].sort().join(",");
  const raw = `${userId}|${input.providerId}|${input.providerServiceId}|${slotIds}`;
  return createHash("sha256").update(raw).digest("hex");
}

export function buildAppointmentRequestKey(
  userId: string | undefined,
  input: {
    providerId: string;
    providerServiceId: string;
    startAt: Date;
    guestPhone?: string;
  },
): string {
  const actor = userId ?? `guest:${input.guestPhone ?? "anonymous"}`;
  const raw = `${actor}|${input.providerId}|${input.providerServiceId}|${input.startAt.toISOString()}`;
  return createHash("sha256").update(raw).digest("hex");
}
