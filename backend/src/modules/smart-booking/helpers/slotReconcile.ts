export type ExistingSlot = {
  id: string;
  startTime: string;
  isBooked: boolean;
  appointmentId: string | null;
};

export type SlotReconcileAction =
  | { type: "keep" }
  | { type: "delete" }
  | { type: "deactivate" };

/** Decide how to handle a persisted slot after a schedule change. */
export function reconcileOrphanSlot(
  startTime: string,
  expectedStartTimes: Set<string>,
  slot: Pick<ExistingSlot, "isBooked" | "appointmentId">,
): SlotReconcileAction {
  if (expectedStartTimes.has(startTime)) {
    return { type: "keep" };
  }

  const hasBooking = slot.isBooked || slot.appointmentId != null;
  return hasBooking ? { type: "deactivate" } : { type: "delete" };
}

export function partitionSlotsForReconcile(
  slots: ExistingSlot[],
  expectedStartTimes: Set<string>,
) {
  const toDelete: string[] = [];
  const toDeactivate: string[] = [];

  for (const slot of slots) {
    const action = reconcileOrphanSlot(slot.startTime, expectedStartTimes, slot);
    if (action.type === "delete") toDelete.push(slot.id);
    if (action.type === "deactivate") toDeactivate.push(slot.id);
  }

  return { toDelete, toDeactivate };
}
