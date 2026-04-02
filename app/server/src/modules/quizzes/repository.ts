import { PrismaClient } from '../../generated/prisma/client';
import { CreateQuizInput } from './dto';

export class QuizRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: CreateQuizInput) {
    return this.prisma.quiz.create({
      data: {
        title: data.title,
        subjectId: data.subjectId,
        timeLimit: data.timeLimit,
        createdBy: userId,
        questions: {
          create: data.questions.map((q) => ({
            questionId: q.questionId,
            order: q.order,
          })),
        },
      },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: { order: 'asc' },
        },
        subject: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findById(quizId: string) {
    return this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: { order: 'asc' },
        },
        subject: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(filters: { subjectId?: string; skip: number; take: number }) {
    const where: Record<string, any> = { isActive: true };

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    return this.prisma.quiz.findMany({
      where,
      include: {
        subject: {
          select: { id: true, name: true, category: true },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(filters: { subjectId?: string }) {
    const where: Record<string, any> = { isActive: true };

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    return this.prisma.quiz.count({ where });
  }

  async findAttempt(attemptId: string, studentId: string) {
    return this.prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        studentId,
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  async createAttempt(studentId: string, quizId: string) {
    return this.prisma.quizAttempt.create({
      data: {
        studentId,
        quizId,
      },
    });
  }

  async updateAttempt(attemptId: string, data: {
    score: number;
    maxScore: number;
    answers: any;
    completedAt: Date;
  }) {
    return this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: data.score,
        maxScore: data.maxScore,
        answers: data.answers,
        completedAt: data.completedAt,
      },
    });
  }
}
