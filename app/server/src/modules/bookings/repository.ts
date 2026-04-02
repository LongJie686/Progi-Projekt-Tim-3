import { PrismaClient, BookingStatus } from '../../generated/prisma/client';
import { CreateBookingInput } from './dto';
import { getSkipTake } from '../../utils/pagination';

export class BookingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    studentId: string;
    tutorId: string;
    subjectId: string;
    bookingDate: Date;
    startTime: string;
    endTime: string;
    format: string;
    price: number;
    notes?: string;
  }) {
    return this.prisma.booking.create({
      data: {
        studentId: data.studentId,
        tutorId: data.tutorId,
        subjectId: data.subjectId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        format: data.format as any,
        price: data.price,
        notes: data.notes,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        subject: { select: { id: true, name: true, category: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        subject: { select: { id: true, name: true, category: true } },
        payment: true,
        review: true,
      },
    });
  }

  async findByStudent(studentId: string, filters: { status?: string; page: number; limit: number }) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const where: any = { studentId };
    if (filters.status) {
      where.status = filters.status as BookingStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tutor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          subject: { select: { id: true, name: true, category: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, total };
  }

  async findByTutor(tutorId: string, filters: { status?: string; page: number; limit: number }) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const where: any = { tutorId };
    if (filters.status) {
      where.status = filters.status as BookingStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          subject: { select: { id: true, name: true, category: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, total };
  }

  async findConflicting(tutorId: string, bookingDate: Date, startTime: string, endTime: string) {
    return this.prisma.booking.findFirst({
      where: {
        tutorId,
        bookingDate,
        status: { in: [BookingStatus.pending, BookingStatus.confirmed] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
  }

  async updateStatus(id: string, status: BookingStatus, cancellationReason?: string) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(cancellationReason && { cancellationReason }),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        tutor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async count(filters: { studentId?: string; tutorId?: string; status?: string }) {
    const where: any = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.tutorId) where.tutorId = filters.tutorId;
    if (filters.status) where.status = filters.status as BookingStatus;

    return this.prisma.booking.count({ where });
  }
}
