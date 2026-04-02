import { PrismaClient } from '../../generated/prisma/client';
import { UserRepository } from './repository';
import { UpdateUserInput } from './dto';
import { AppError } from '../../utils/AppError';

export class UserService {
  private repo: UserRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new UserRepository(prisma);
  }

  async getProfile(userId: string) {
    const user = await this.repo.findByIdWithProfile(userId);
    if (!user) {
      throw AppError.notFound('User');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, data: UpdateUserInput) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw AppError.notFound('User');
    }

    const updated = await this.repo.updateProfile(userId, data);
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }
}
