import { PrismaClient, BookingStatus } from '../../generated/prisma/client';
import { ReviewRepository } from './repository';
import { CreateReviewInput, UpdateReviewInput } from './dto';
import { AppError } from '../../utils/AppError';
import { createPaginatedResult } from '../../utils/pagination';

export class ReviewService {
  private repo: ReviewRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.repo = new ReviewRepository(prisma);
  }

  async create(studentId: string, data: CreateReviewInput) {
    // Verify booking exists and belongs to this student
    const booking = await this.prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      throw AppError.notFound('Booking');
    }

    if (booking.studentId !== studentId) {
      throw AppError.forbidden('You can only review your own bookings');
    }

    // Verify booking is completed
    if (booking.status !== BookingStatus.completed) {
      throw AppError.badRequest('You can only review completed bookings');
    }

    // Verify no existing review for this booking
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: data.bookingId },
    });

    if (existingReview) {
      throw AppError.conflict('This booking has already been reviewed');
    }

    const review = await this.repo.create({
      bookingId: data.bookingId,
      studentId,
      tutorId: booking.tutorId,
      rating: data.rating,
      communication: data.communication,
      expertise: data.expertise,
      preparation: data.preparation,
      value: data.value,
      comment: data.comment,
    });

    // Recalculate tutor's average rating
    await this.recalculateTutorRating(booking.tutorId);

    return review;
  }

  async list(filters: { tutorId?: string; studentId?: string; page: number; limit: number }) {
    let result;

    if (filters.tutorId) {
      result = await this.repo.findByTutor(filters.tutorId, {
        page: filters.page,
        limit: filters.limit,
      });
    } else if (filters.studentId) {
      result = await this.repo.findByStudent(filters.studentId, {
        page: filters.page,
        limit: filters.limit,
      });
    } else {
      // No specific filter - return all reviews (public access)
      // Use tutor-based query with a broad filter approach
      const { skip, take } = { skip: (filters.page - 1) * filters.limit, take: filters.limit };
      const [items, total] = await Promise.all([
        this.prisma.review.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            booking: { select: { id: true, subject: { select: { name: true } } } },
          },
        }),
        this.prisma.review.count(),
      ]);
      result = { items, total };
    }

    return createPaginatedResult(result.items as any[], result.total, filters.page, filters.limit);
  }

  async update(reviewId: string, studentId: string, data: UpdateReviewInput) {
    const review = await this.repo.findById(reviewId);

    if (!review) {
      throw AppError.notFound('Review');
    }

    if (review.studentId !== studentId) {
      throw AppError.forbidden('You can only update your own reviews');
    }

    const updated = await this.repo.update(reviewId, data);

    // Recalculate tutor's average rating
    await this.recalculateTutorRating(review.tutorId);

    return updated;
  }

  async addResponse(reviewId: string, tutorId: string, response: string) {
    const review = await this.repo.findById(reviewId);

    if (!review) {
      throw AppError.notFound('Review');
    }

    if (review.tutorId !== tutorId) {
      throw AppError.forbidden('Only the reviewed tutor can respond to this review');
    }

    if (review.tutorResponse) {
      throw AppError.conflict('You have already responded to this review');
    }

    return this.repo.addResponse(reviewId, response);
  }

  private async recalculateTutorRating(tutorId: string) {
    const stats = await this.repo.getAverageRating(tutorId);

    await this.prisma.tutorProfile.update({
      where: { userId: tutorId },
      data: {
        avgRating: Math.round(stats.avgRating * 100) / 100,
        totalReviews: stats.totalReviews,
      },
    });
  }
}
