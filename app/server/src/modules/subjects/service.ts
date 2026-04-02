import { PrismaClient } from '../../generated/prisma/client';
import { SubjectRepository } from './repository';
import { SubjectFilterInput } from './dto';
import { AppError } from '../../utils/AppError';

export class SubjectService {
  private repo: SubjectRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new SubjectRepository(prisma);
  }

  async list(filters: SubjectFilterInput) {
    return this.repo.findAll(filters);
  }

  async getById(id: string) {
    const subject = await this.repo.findById(id);
    if (!subject) {
      throw AppError.notFound('Subject');
    }
    return subject;
  }
}
