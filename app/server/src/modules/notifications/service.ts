import { PrismaClient } from '../../generated/prisma/client';
import { NotificationRepository } from './repository';
import { NotificationFilterInput } from './dto';
import { AppError } from '../../utils/AppError';
import { createPaginatedResult, getSkipTake } from '../../utils/pagination';

export class NotificationService {
  private repo: NotificationRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new NotificationRepository(prisma);
  }

  async list(userId: string, filters: NotificationFilterInput) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const [notifications, total] = await Promise.all([
      this.repo.findByUser(userId, {
        isRead: filters.isRead,
        skip,
        take,
      }),
      this.repo.countByUser(userId, filters.isRead),
    ]);

    return createPaginatedResult(notifications, total, filters.page, filters.limit);
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.findUnreadCount(userId);
    return { count };
  }

  async markRead(notificationId: string, userId: string) {
    const result = await this.repo.markRead(notificationId, userId);
    if (result.count === 0) {
      throw AppError.notFound('Notification');
    }
    return { marked: true };
  }

  async markAllRead(userId: string) {
    const result = await this.repo.markAllRead(userId);
    return { marked: result.count };
  }

  async create(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ) {
    const notification = await this.repo.create({
      userId,
      type,
      title,
      message,
      data,
    });
    return notification;
  }

  async notifyUsers(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    data?: any
  ) {
    const notifications = userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      data,
    }));

    const result = await this.repo.createMany(notifications);
    return { created: result.count };
  }
}
