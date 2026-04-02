import { PrismaClient } from '../../generated/prisma/client';
import { TutorRepository } from './repository';
import { SearchTutorsInput, UpdateTutorProfileInput, AvailabilityInput } from './dto';
import { AppError } from '../../utils/AppError';
import { createPaginatedResult } from '../../utils/pagination';

export class TutorService {
  private repo: TutorRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new TutorRepository(prisma);
  }

  async search(filters: SearchTutorsInput) {
    const { page, limit } = filters;
    const { items, total } = await this.repo.search(filters);
    return createPaginatedResult(items, total, page, limit);
  }

  async getProfile(id: string) {
    const tutor = await this.repo.findById(id);
    if (!tutor) {
      throw AppError.notFound('Tutor profile');
    }
    return tutor;
  }

  async updateProfile(tutorId: string, userId: string, data: UpdateTutorProfileInput) {
    const profile = await this.repo.findById(tutorId);
    if (!profile) {
      throw AppError.notFound('Tutor profile');
    }

    if (profile.userId !== userId) {
      throw AppError.forbidden('You can only update your own profile');
    }

    const updateData: Record<string, any> = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.education !== undefined) updateData.education = data.education;
    if (data.hourlyRate30 !== undefined) updateData.hourlyRate30 = data.hourlyRate30;
    if (data.hourlyRate45 !== undefined) updateData.hourlyRate45 = data.hourlyRate45;
    if (data.hourlyRate60 !== undefined) updateData.hourlyRate60 = data.hourlyRate60;
    if (data.hourlyRate90 !== undefined) updateData.hourlyRate90 = data.hourlyRate90;
    if (data.onlineRate !== undefined) updateData.onlineRate = data.onlineRate;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.introVideoUrl !== undefined) updateData.introVideoUrl = data.introVideoUrl;

    return this.repo.update(tutorId, updateData);
  }

  async getAvailability(tutorId: string) {
    const profile = await this.repo.findById(tutorId);
    if (!profile) {
      throw AppError.notFound('Tutor profile');
    }

    return this.repo.getTimeSlots(tutorId);
  }

  async setAvailability(tutorId: string, userId: string, data: AvailabilityInput) {
    const profile = await this.repo.findById(tutorId);
    if (!profile) {
      throw AppError.notFound('Tutor profile');
    }

    if (profile.userId !== userId) {
      throw AppError.forbidden('You can only update your own availability');
    }

    return this.repo.replaceTimeSlots(tutorId, data.slots);
  }
}
