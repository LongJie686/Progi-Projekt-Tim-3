import { PrismaClient } from '../../generated/prisma/client';
import { SearchTutorsInput } from './dto';
import { getSkipTake } from '../../utils/pagination';

export class TutorRepository {
  constructor(private prisma: PrismaClient) {}

  async search(filters: SearchTutorsInput) {
    const { subject, minRating, maxRate, location, page, limit, sort } = filters;
    const { skip, take } = getSkipTake(page, limit);

    const where: Record<string, any> = {};

    if (minRating !== undefined) {
      where.avgRating = { gte: minRating };
    }

    if (maxRate !== undefined) {
      where.hourlyRate60 = { lte: maxRate };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (subject) {
      where.subjects = {
        some: {
          subject: {
            name: { contains: subject, mode: 'insensitive' },
          },
        },
      };
    }

    const orderBy: Record<string, any> = {};
    switch (sort) {
      case 'rating':
        orderBy.avgRating = 'desc';
        break;
      case 'price_asc':
        orderBy.hourlyRate60 = 'asc';
        break;
      case 'price_desc':
        orderBy.hourlyRate60 = 'desc';
        break;
      case 'reviews':
        orderBy.totalReviews = 'desc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.tutorProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          subjects: {
            include: {
              subject: true,
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.tutorProfile.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
            isVerified: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
        timeSlots: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.tutorProfile.findUnique({
      where: { userId },
    });
  }

  async update(id: string, data: Record<string, any>) {
    return this.prisma.tutorProfile.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  async getTimeSlots(tutorId: string) {
    return this.prisma.timeSlot.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async replaceTimeSlots(tutorId: string, slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) {
    return this.prisma.$transaction(async (tx) => {
      await tx.timeSlot.deleteMany({ where: { tutorId } });

      if (slots.length > 0) {
        await tx.timeSlot.createMany({
          data: slots.map((slot) => ({
            tutorId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      return tx.timeSlot.findMany({
        where: { tutorId },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    });
  }
}
