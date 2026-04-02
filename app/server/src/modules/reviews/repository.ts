import { PrismaClient } from '../../generated/prisma/client';
import { getSkipTake } from '../../utils/pagination';

export class ReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    bookingId: string;
    studentId: string;
    tutorId: string;
    rating: number;
    communication?: number;
    expertise?: number;
    preparation?: number;
    value?: number;
    comment?: string;
  }) {
    return this.prisma.review.create({
      data: {
        bookingId: data.bookingId,
        studentId: data.studentId,
        tutorId: data.tutorId,
        rating: data.rating,
        communication: data.communication,
        expertise: data.expertise,
        preparation: data.preparation,
        value: data.value,
        comment: data.comment,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        booking: { select: { id: true, subject: { select: { name: true } } } },
      },
    });
  }

  async findByTutor(tutorId: string, filters: { page: number; limit: number }) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const where = { tutorId };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          booking: { select: { id: true, subject: { select: { name: true } } } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total };
  }

  async findByStudent(studentId: string, filters: { page: number; limit: number }) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const where = { studentId };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          booking: { select: { id: true, subject: { select: { name: true } } } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        booking: { select: { id: true, subject: { select: { name: true } } } },
      },
    });
  }

  async update(id: string, data: {
    rating?: number;
    communication?: number;
    expertise?: number;
    preparation?: number;
    value?: number;
    comment?: string;
  }) {
    return this.prisma.review.update({
      where: { id },
      data,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        booking: { select: { id: true, subject: { select: { name: true } } } },
      },
    });
  }

  async addResponse(id: string, response: string) {
    return this.prisma.review.update({
      where: { id },
      data: { tutorResponse: response },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        booking: { select: { id: true, subject: { select: { name: true } } } },
      },
    });
  }

  async count(tutorId: string) {
    return this.prisma.review.count({ where: { tutorId } });
  }

  async getAverageRating(tutorId: string) {
    const result = await this.prisma.review.aggregate({
      where: { tutorId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      avgRating: result._avg.rating ?? 0,
      totalReviews: result._count.rating,
    };
  }
}
