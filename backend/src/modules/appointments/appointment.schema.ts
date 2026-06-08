import { z } from "zod";

export const bookAppointmentSchema = z
  .object({
    providerId: z.string().cuid(),
    providerServiceId: z.string().cuid(),
    startAt: z.string().datetime(),
    notes: z.string().max(1000).optional(),
    guestFullName: z.string().min(2).optional(),
    guestPhone: z.string().min(10).optional(),
    guestEmail: z.string().email().optional(),
  })
  .superRefine((data, ctx) => {
    const hasGuest = data.guestFullName || data.guestPhone || data.guestEmail;
    if (hasGuest && (!data.guestFullName || !data.guestPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guest bookings require guestFullName and guestPhone",
      });
    }
  });

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const appointmentIdSchema = z.object({ id: z.string().cuid() });

export const myAppointmentsQuerySchema = z.object({
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const payAppointmentSchema = z.object({}).optional();
