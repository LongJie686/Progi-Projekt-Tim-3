import { PrismaClient, User } from '../../generated/prisma/client';
import { RegisterInput } from './dto';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        tutorProfile: true,
      },
    });
  }

  async create(data: RegisterInput, passwordHash: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        ...(data.role === 'STUDENT'
          ? { studentProfile: { create: {} } }
          : { tutorProfile: { create: {} } }),
      },
    });
  }

  async updateVerificationStatus(userId: string, isVerified: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isVerified },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async createOAuthConnection(data: {
    userId: string;
    provider: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
  }) {
    return this.prisma.oAuthConnection.upsert({
      where: {
        provider_providerId: {
          provider: data.provider,
          providerId: data.providerId,
        },
      },
      create: data,
      update: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    });
  }

  async findOAuthUser(provider: string, providerId: string) {
    return this.prisma.oAuthConnection.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true },
    });
  }
}
