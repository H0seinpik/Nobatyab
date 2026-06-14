import { apiPatch } from "@/services/api";

export interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  paymentStatus: string;
}

export async function cancelAppointment(id: string, reason?: string) {
  const res = await apiPatch<Appointment>(`/appointments/${id}/cancel`, { reason });
  return res.data;
}

export function isAppointmentCancellable(appointment: {
  status: string;
  startAt: string;
}): boolean {
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    return false;
  }
  return new Date(appointment.startAt) > new Date();
}
