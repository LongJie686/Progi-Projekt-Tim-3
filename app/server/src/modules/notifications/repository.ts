import { PrismaClient } from '../../generated/prisma/client';

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUser(
    userId: string,
    filters: { isRead?: boolean; skip: number; take: number }
  ) {
    const where: Record<string, any> = { userId };

    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    return this.prisma.notification.findMany({
      where,
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByUser(userId: string, isRead?: boolean) {
    const where: Record<string, any> = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.prisma.notification.count({ where });
  }

  async findUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  async createMany(
    notifications: Array<{
      userId: string;
      type: string;
      title: string;
      message: string;
      data?: any;
    }>
  ) {
    return this.prisma.notification.createMany({
      data: notifications,
    });
  }
}
