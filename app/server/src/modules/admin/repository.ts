import { PrismaClient } from '../../generated/prisma/client';
import { UpdateUserInput } from './dto';

export class AdminRepository {
  constructor(private prisma: PrismaClient) {}

  async listUsers(filters: {
    role?: string;
    search?: string;
    skip: number;
    take: number;
  }) {
    const where: Record<string, any> = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        studentProfile: true,
        tutorProfile: true,
      },
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countUsers(filters: { role?: string; search?: string }) {
    const where: Record<string, any> = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.count({ where });
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        tutorProfile: true,
      },
    });
  }

  async updateUser(userId: string, data: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });
  }

  async countBookings() {
    return this.prisma.booking.count();
  }

  async countActiveBookings() {
    return this.prisma.booking.count({
      where: {
        status: { in: ['pending', 'confirmed'] },
      },
    });
  }

  async sumRevenue() {
    const result = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' },
    });
    return result._sum.amount;
  }

  async countPendingVerifications() {
    return this.prisma.tutorProfile.count({
      where: { isVerified: false },
    });
  }

  async findAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    skip: number;
    take: number;
  }) {
    const where: Record<string, any> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, any>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, any>).lte = filters.endDate;
      }
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Record<string, any> = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, any>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, any>).lte = filters.endDate;
      }
    }

    return this.prisma.auditLog.count({ where });
  }

  async createAuditLog(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
