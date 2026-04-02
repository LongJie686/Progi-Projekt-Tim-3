import { PrismaClient } from '../../generated/prisma/client';
import { SubjectFilterInput } from './dto';

export class SubjectRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters: SubjectFilterInput) {
    const where: Record<string, any> = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.level) {
      where.level = filters.level;
    }

    return this.prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        tutorSubjects: {
          include: {
            tutor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
