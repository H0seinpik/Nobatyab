import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import type { CreateReviewInput } from "./review.schema.js";

export class ReviewRepository {
  findByAppointmentId(appointmentId: string) {
    return prisma.review.findUnique({ where: { appointmentId } });
  }

  create(data: {
    appointmentId: string;
    userId: string;
    providerId: string;
    rating: number;
    comment?: string;
  }) {
    return prisma.review.create({
      data,
      include: {
        user: { select: { fullName: true } },
      },
    });
  }

  findByProvider(providerId: string, skip: number, take: number) {
    return Promise.all([
      prisma.review.findMany({
        where: { providerId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true } } },
      }),
      prisma.review.count({ where: { providerId } }),
    ]);
  }

  getRatingSummary(providerId: string) {
    return prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { avgRating: true, reviewCount: true },
    });
  }
}

export const reviewRepository = new ReviewRepository();

export async function recalculateProviderRating(providerId: string) {
  const agg = await prisma.review.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

export async function validateReviewEligibility(appointmentId: string, userId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { review: true },
  });

  if (!appointment) throw ApiError.notFound("Appointment not found");
  if (appointment.userId !== userId) throw ApiError.forbidden("Not your appointment");
  if (appointment.status !== AppointmentStatus.COMPLETED) {
    throw ApiError.badRequest("Only completed appointments can be reviewed");
  }
  if (appointment.review) throw ApiError.conflict("Review already submitted");

  return appointment;
}

export class ReviewService {
  private repo = reviewRepository;

  async createReview(userId: string, appointmentId: string, input: CreateReviewInput) {
    const appointment = await validateReviewEligibility(appointmentId, userId);

    const review = await this.repo.create({
      appointmentId,
      userId,
      providerId: appointment.providerId,
      rating: input.rating,
      comment: input.comment,
    });

    await recalculateProviderRating(appointment.providerId);
    return review;
  }

  async listProviderReviews(providerId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await this.repo.findByProvider(providerId, skip, limit);
    return {
      items: items.map((r: { id: string; rating: number; comment: string | null; createdAt: Date; user: { fullName: string } }) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        authorName: r.user.fullName,
      })),
      meta: paginationMeta(page, limit, total),
    };
  }

  async getRatingSummary(providerId: string) {
    const summary = await this.repo.getRatingSummary(providerId);
    if (!summary) throw ApiError.notFound("Provider not found");
    return summary;
  }
}

export const reviewService = new ReviewService();
