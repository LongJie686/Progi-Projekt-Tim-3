import { PrismaClient, PaymentStatus, BookingStatus } from '../../generated/prisma/client';
import { PaymentRepository } from './repository';
import { AppError } from '../../utils/AppError';
import { createPaginatedResult } from '../../utils/pagination';

// TODO: Import Stripe when integrating
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-xx-xx' });

const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee

export class PaymentService {
  private repo: PaymentRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.repo = new PaymentRepository(prisma);
  }

  async createIntent(userId: string, bookingId: string) {
    // Verify booking exists and belongs to the student
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { id: true } },
        tutor: { select: { id: true, tutorProfile: true } },
      },
    });

    if (!booking) {
      throw AppError.notFound('Booking');
    }

    if (booking.studentId !== userId) {
      throw AppError.forbidden('You can only create payments for your own bookings');
    }

    if (booking.status !== BookingStatus.confirmed) {
      throw AppError.badRequest('Booking must be confirmed before payment');
    }

    // Check if payment already exists for this booking
    const existingPayment = await this.repo.findByBookingId(bookingId);
    if (existingPayment) {
      throw AppError.conflict('Payment already exists for this booking');
    }

    const amount = Number(booking.price) || 0;
    if (amount <= 0) {
      throw AppError.badRequest('Invalid booking price');
    }

    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;

    // TODO: Create actual Stripe PaymentIntent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Stripe expects cents
    //   currency: 'usd',
    //   metadata: {
    //     bookingId,
    //     studentId: userId,
    //     tutorId: booking.tutorId,
    //   },
    //   capture_method: 'manual', // Manual capture for escrow
    // });
    const mockStripePaymentId = `pi_mock_${Date.now()}`;

    const payment = await this.repo.create({
      bookingId,
      stripePaymentId: mockStripePaymentId,
      amount,
      platformFee,
    });

    // TODO: Return actual client_secret from Stripe
    return {
      ...payment,
      clientSecret: `${mockStripePaymentId}_secret_mock`,
    };
  }

  async handleWebhook(event: { type: string; data: { object: any } }) {
    const { type, data } = event;

    // TODO: Verify webhook signature using Stripe
    // const signature = headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    switch (type) {
      case 'payment_intent.succeeded': {
        // TODO: Extract payment intent ID from actual Stripe event
        const stripePaymentId = data.object.id;
        const payment = await this.prisma.payment.findFirst({
          where: { stripePaymentId },
        });
        if (payment) {
          await this.repo.updateStatus(payment.id, PaymentStatus.processing);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const stripePaymentId = data.object.id;
        const payment = await this.prisma.payment.findFirst({
          where: { stripePaymentId },
        });
        if (payment) {
          await this.repo.updateStatus(payment.id, PaymentStatus.failed);
        }
        break;
      }

      case 'charge.refunded': {
        const stripePaymentId = data.object.payment_intent;
        const payment = await this.prisma.payment.findFirst({
          where: { stripePaymentId },
        });
        if (payment) {
          await this.repo.updateStatus(payment.id, PaymentStatus.refunded);
        }
        break;
      }

      default:
        // Unhandled event type - log but don't error
        break;
    }
  }

  async getHistory(userId: string, filters: { status?: string; page: number; limit: number }) {
    const result = await this.repo.findByUserId(userId, filters);
    return createPaginatedResult(result.items, result.total, filters.page, filters.limit);
  }

  async releaseEscrow(paymentId: string) {
    const payment = await this.repo.findById(paymentId);

    if (!payment) {
      throw AppError.notFound('Payment');
    }

    if (payment.status !== PaymentStatus.processing) {
      throw AppError.badRequest('Payment must be in processing state to release escrow');
    }

    // TODO: Capture the payment intent in Stripe
    // await stripe.paymentIntents.capture(payment.stripePaymentId!);

    const updated = await this.repo.releaseEscrow(paymentId);
    return updated;
  }
}
