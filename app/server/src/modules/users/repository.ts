import { PrismaClient } from '../../generated/prisma/client';
import { UpdateUserInput } from './dto';

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdWithProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        tutorProfile: {
          include: {
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });
  }

  async updateProfile(id: string, data: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        studentProfile: true,
        tutorProfile: true,
      },
    });
  }
}
