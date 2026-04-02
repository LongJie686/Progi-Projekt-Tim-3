import { PrismaClient, BookingStatus } from '../../generated/prisma/client';
import { BookingRepository } from './repository';
import { CreateBookingInput, UpdateStatusInput } from './dto';
import { AppError } from '../../utils/AppError';
import { createPaginatedResult } from '../../utils/pagination';

const VALID_TRANSITIONS: Record<string, BookingStatus[]> = {
  pending: [BookingStatus.confirmed, BookingStatus.cancelled],
  confirmed: [BookingStatus.completed, BookingStatus.cancelled, BookingStatus.no_show],
  completed: [],
  cancelled: [],
  no_show: [],
};

export class BookingService {
  private repo: BookingRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.repo = new BookingRepository(prisma);
  }

  async create(studentId: string, data: CreateBookingInput) {
    // Verify tutor exists and has a tutor profile
    const tutor = await this.prisma.user.findUnique({
      where: { id: data.tutorId },
      include: { tutorProfile: true },
    });

    if (!tutor || tutor.role !== 'TUTOR') {
      throw AppError.notFound('Tutor');
    }

    if (!tutor.tutorProfile) {
      throw AppError.badRequest('Tutor profile not found');
    }

    // Verify subject exists and tutor teaches it
    const tutorSubject = await this.prisma.tutorSubject.findFirst({
      where: { tutorId: tutor.tutorProfile.id, subjectId: data.subjectId },
    });

    if (!tutorSubject) {
      throw AppError.badRequest('Tutor does not teach this subject');
    }

    // Parse booking date
    const bookingDate = new Date(data.bookingDate + 'T00:00:00.000Z');

    // Check for time conflicts
    const conflict = await this.repo.findConflicting(
      data.tutorId,
      bookingDate,
      data.startTime,
      data.endTime
    );

    if (conflict) {
      throw AppError.conflict('Tutor already has a booking at this time');
    }

    // Calculate price based on duration and tutor rates
    const price = this.calculatePrice(data.startTime, data.endTime, tutor.tutorProfile, data.format);

    const booking = await this.repo.create({
      studentId,
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      format: data.format,
      price,
      notes: data.notes,
    });

    return booking;
  }

  async getById(userId: string, bookingId: string) {
    const booking = await this.repo.findById(bookingId);

    if (!booking) {
      throw AppError.notFound('Booking');
    }

    // Verify user is either the student or tutor of this booking
    if (booking.studentId !== userId && booking.tutorId !== userId) {
      throw AppError.forbidden('You can only view your own bookings');
    }

    return booking;
  }

  async list(userId: string, role: string | undefined, filters: { status?: string; page: number; limit: number }) {
    let result;

    if (role === 'tutor') {
      result = await this.repo.findByTutor(userId, filters);
    } else {
      // Default to student view
      result = await this.repo.findByStudent(userId, filters);
    }

    return createPaginatedResult(result.items as any[], result.total, filters.page, filters.limit);
  }

  async updateStatus(userId: string, bookingId: string, data: UpdateStatusInput) {
    const booking = await this.repo.findById(bookingId);

    if (!booking) {
      throw AppError.notFound('Booking');
    }

    const newStatus = data.status as BookingStatus;

    // Validate status transition is allowed
    const allowedTransitions = VALID_TRANSITIONS[booking.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw AppError.badRequest(
        `Cannot transition from ${booking.status} to ${newStatus}`
      );
    }

    // Role-based permission checks
    if (newStatus === BookingStatus.confirmed) {
      // Only tutor can confirm
      if (booking.tutorId !== userId) {
        throw AppError.forbidden('Only the tutor can confirm a booking');
      }
    } else if (newStatus === BookingStatus.completed || newStatus === BookingStatus.no_show) {
      // Only tutor can mark completed or no_show
      if (booking.tutorId !== userId) {
        throw AppError.forbidden('Only the tutor can mark a booking as completed or no_show');
      }
    } else if (newStatus === BookingStatus.cancelled) {
      // Both student and tutor can cancel
      if (booking.studentId !== userId && booking.tutorId !== userId) {
        throw AppError.forbidden('Only the student or tutor can cancel a booking');
      }
    }

    const cancellationReason = newStatus === BookingStatus.cancelled ? data.cancellationReason : undefined;

    const updated = await this.repo.updateStatus(bookingId, newStatus, cancellationReason);

    // If booking is completed, increment tutor's totalSessions
    if (newStatus === BookingStatus.completed) {
      await this.prisma.tutorProfile.update({
        where: { userId: booking.tutorId },
        data: { totalSessions: { increment: 1 } },
      });
    }

    return updated;
  }

  private calculatePrice(
    startTime: string,
    endTime: string,
    tutorProfile: { hourlyRate30: any; hourlyRate45: any; hourlyRate60: any; hourlyRate90: any; onlineRate: any },
    format: string
  ): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    let rate: number | null = null;

    // Match rate to closest session duration
    if (durationMinutes <= 30 && tutorProfile.hourlyRate30) {
      rate = Number(tutorProfile.hourlyRate30);
    } else if (durationMinutes <= 45 && tutorProfile.hourlyRate45) {
      rate = Number(tutorProfile.hourlyRate45);
    } else if (durationMinutes <= 60 && tutorProfile.hourlyRate60) {
      rate = Number(tutorProfile.hourlyRate60);
    } else if (durationMinutes <= 90 && tutorProfile.hourlyRate90) {
      rate = Number(tutorProfile.hourlyRate90);
    } else if (tutorProfile.hourlyRate60) {
      // Fallback: prorate based on 60-minute rate
      rate = (Number(tutorProfile.hourlyRate60) / 60) * durationMinutes;
    }

    if (rate === null) {
      rate = 0;
    }

    // Apply online rate adjustment if applicable
    if (format === 'online' && tutorProfile.onlineRate) {
      rate = rate * Number(tutorProfile.onlineRate);
    }

    return Math.round(rate * 100) / 100;
  }
}
