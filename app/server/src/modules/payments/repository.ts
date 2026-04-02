import { PrismaClient, PaymentStatus } from '../../generated/prisma/client';
import { getSkipTake } from '../../utils/pagination';

export class PaymentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    bookingId: string;
    stripePaymentId: string;
    amount: number;
    platformFee: number;
  }) {
    return this.prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        stripePaymentId: data.stripePaymentId,
        amount: data.amount,
        platformFee: data.platformFee,
        status: PaymentStatus.pending,
      },
      include: {
        booking: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            tutor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findByBookingId(bookingId: string) {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            tutor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            tutor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: PaymentStatus) {
    return this.prisma.payment.update({
      where: { id },
      data: { status },
    });
  }

  async releaseEscrow(id: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.completed,
        escrowReleasedAt: new Date(),
      },
    });
  }

  async findByUserId(userId: string, filters: { status?: string; page: number; limit: number }) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const where: any = {
      booking: {
        OR: [{ studentId: userId }, { tutorId: userId }],
      },
    };

    if (filters.status) {
      where.status = filters.status as PaymentStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              student: { select: { id: true, firstName: true, lastName: true } },
              tutor: { select: { id: true, firstName: true, lastName: true } },
              subject: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, total };
  }
}
