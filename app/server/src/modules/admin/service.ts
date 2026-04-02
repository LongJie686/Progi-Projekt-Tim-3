import { PrismaClient } from '../../generated/prisma/client';
import { AdminRepository } from './repository';
import { UserFilterInput, UpdateUserInput, VerifyTutorInput, AuditLogFilterInput } from './dto';
import { AppError } from '../../utils/AppError';
import { createPaginatedResult, getSkipTake } from '../../utils/pagination';

export class AdminService {
  private repo: AdminRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new AdminRepository(prisma);
  }

  async listUsers(filters: UserFilterInput) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const [users, total] = await Promise.all([
      this.repo.listUsers({
        role: filters.role,
        search: filters.search,
        skip,
        take,
      }),
      this.repo.countUsers({
        role: filters.role,
        search: filters.search,
      }),
    ]);

    return createPaginatedResult(users, total, filters.page, filters.limit);
  }

  async updateUser(adminId: string, userId: string, data: UpdateUserInput) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User');
    }

    const updated = await this.repo.updateUser(userId, data);

    await this.repo.createAuditLog({
      userId: adminId,
      action: 'UPDATE_USER',
      resource: 'User',
      resourceId: userId,
      details: { updatedFields: Object.keys(data) },
    });

    return updated;
  }

  async verifyTutor(adminId: string, tutorId: string, data: VerifyTutorInput) {
    const user = await this.repo.findUserById(tutorId);
    if (!user) {
      throw AppError.notFound('User');
    }

    if (user.role !== 'TUTOR') {
      throw AppError.badRequest('User is not a tutor');
    }

    const updated = await this.repo.updateUser(tutorId, {
      isVerified: data.isVerified,
    });

    await this.repo.createAuditLog({
      userId: adminId,
      action: data.isVerified ? 'VERIFY_TUTOR' : 'REJECT_TUTOR',
      resource: 'User',
      resourceId: tutorId,
      details: {
        isVerified: data.isVerified,
        reason: data.reason,
      },
    });

    return updated;
  }

  async getStats() {
    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalAdministrators,
      totalBookings,
      totalRevenue,
      activeBookings,
      pendingVerifications,
    ] = await Promise.all([
      this.repo.countUsers({}),
      this.repo.countUsers({ role: 'STUDENT' }),
      this.repo.countUsers({ role: 'TUTOR' }),
      this.repo.countUsers({ role: 'ADMINISTRATOR' }),
      this.repo.countBookings(),
      this.repo.sumRevenue(),
      this.repo.countActiveBookings(),
      this.repo.countPendingVerifications(),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalTutors,
      totalAdministrators,
      totalBookings,
      totalRevenue: totalRevenue ?? 0,
      activeBookings,
      pendingVerifications,
    };
  }

  async getAuditLogs(filters: AuditLogFilterInput) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const [logs, total] = await Promise.all([
      this.repo.findAuditLogs({
        userId: filters.userId,
        action: filters.action,
        startDate: filters.startDate,
        endDate: filters.endDate,
        skip,
        take,
      }),
      this.repo.countAuditLogs({
        userId: filters.userId,
        action: filters.action,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
    ]);

    return createPaginatedResult(logs, total, filters.page, filters.limit);
  }
}
