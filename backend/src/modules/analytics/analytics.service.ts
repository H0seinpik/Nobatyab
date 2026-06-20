import { AppointmentStatus, PaymentTransactionStatus, Role } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class AnalyticsService {
  async getOverview() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeProviders,
      totalAppointments,
      appointmentsThisMonth,
      pendingServiceRequests,
      pendingProviderRequests,
      activeServices,
      revenueResult,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.user.count({ where: { role: Role.PROVIDER, isActive: true } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { startAt: { gte: monthStart } } }),
      prisma.serviceRequest.count({ where: { status: "PENDING" } }),
      prisma.providerRequest.count({ where: { status: "PENDING" } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.paymentTransaction.aggregate({
        where: { status: PaymentTransactionStatus.SUCCESS },
        _sum: { amount: true },
      }),
    ]);

    return {
      users: totalUsers,
      providers: activeProviders,
      appointments: totalAppointments,
      appointmentsThisMonth,
      pendingServiceRequests,
      pendingProviderRequests,
      services: activeServices,
      revenue: Number(revenueResult._sum.amount ?? 0),
    };
  }

  async getTrends(months = 6) {
    const safeMonths = Math.min(12, Math.max(1, months));
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (safeMonths - 1), 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        startAt: { gte: start },
        status: { not: AppointmentStatus.CANCELLED },
      },
      select: { startAt: true },
    });

    const payments = await prisma.paymentTransaction.findMany({
      where: {
        status: PaymentTransactionStatus.SUCCESS,
        createdAt: { gte: start },
      },
      select: { amount: true, createdAt: true },
    });

    const labels: string[] = [];
    const appointmentCounts: number[] = [];
    const revenueCounts: number[] = [];

    for (let i = safeMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      labels.push(key);

      appointmentCounts.push(
        appointments.filter(
          (a) =>
            a.startAt.getFullYear() === d.getFullYear() && a.startAt.getMonth() === d.getMonth(),
        ).length,
      );

      revenueCounts.push(
        payments
          .filter(
            (p) =>
              p.createdAt.getFullYear() === d.getFullYear() &&
              p.createdAt.getMonth() === d.getMonth(),
          )
          .reduce((sum, p) => sum + Number(p.amount), 0),
      );
    }

    return { labels, appointments: appointmentCounts, revenue: revenueCounts };
  }
}

export const analyticsService = new AnalyticsService();
