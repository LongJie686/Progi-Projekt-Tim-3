import { PrismaClient } from '../../generated/prisma/client';
import { QuizRepository } from './repository';
import { CreateQuizInput, QuizFilterInput, SubmitAnswersInput } from './dto';
import { AppError } from '../../utils/AppError';
import { createPaginatedResult, getSkipTake } from '../../utils/pagination';

export class QuizService {
  private repo: QuizRepository;

  constructor(prisma: PrismaClient) {
    this.repo = new QuizRepository(prisma);
  }

  async create(userId: string, data: CreateQuizInput) {
    const quiz = await this.repo.create(userId, data);
    return quiz;
  }

  async getById(quizId: string) {
    const quiz = await this.repo.findById(quizId);
    if (!quiz) {
      throw AppError.notFound('Quiz');
    }

    // Strip correct answers from questions for students
    const sanitizedQuestions = quiz.questions.map((qq) => ({
      id: qq.id,
      order: qq.order,
      question: {
        id: qq.question.id,
        type: qq.question.type,
        difficulty: qq.question.difficulty,
        content: qq.question.content,
        options: qq.question.options,
        points: qq.question.points,
      },
    }));

    return {
      ...quiz,
      questions: sanitizedQuestions,
    };
  }

  async list(filters: QuizFilterInput) {
    const { skip, take } = getSkipTake(filters.page, filters.limit);

    const [quizzes, total] = await Promise.all([
      this.repo.findAll({
        subjectId: filters.subjectId,
        skip,
        take,
      }),
      this.repo.count({
        subjectId: filters.subjectId,
      }),
    ]);

    return createPaginatedResult(quizzes, total, filters.page, filters.limit);
  }

  async startAttempt(studentId: string, quizId: string) {
    const quiz = await this.repo.findById(quizId);
    if (!quiz) {
      throw AppError.notFound('Quiz');
    }

    if (!quiz.isActive) {
      throw AppError.badRequest('This quiz is not currently active');
    }

    const attempt = await this.repo.createAttempt(studentId, quizId);
    return attempt;
  }

  async submitAttempt(
    studentId: string,
    quizId: string,
    attemptId: string,
    data: SubmitAnswersInput
  ) {
    const attempt = await this.repo.findAttempt(attemptId, studentId);
    if (!attempt) {
      throw AppError.notFound('Quiz attempt');
    }

    if (attempt.quizId !== quizId) {
      throw AppError.badRequest('Attempt does not belong to this quiz');
    }

    if (attempt.completedAt) {
      throw AppError.badRequest('This attempt has already been submitted');
    }

    // Calculate score
    const quizQuestions = attempt.quiz.questions;
    let score = 0;
    let maxScore = 0;

    const answerResults = data.answers.map((submitted) => {
      const quizQuestion = quizQuestions.find(
        (qq) => qq.questionId === submitted.questionId
      );

      if (!quizQuestion) {
        return {
          questionId: submitted.questionId,
          answer: submitted.answer,
          isCorrect: false,
          points: 0,
        };
      }

      const points = quizQuestion.question.points;
      maxScore += points;

      const isCorrect =
        submitted.answer.trim().toLowerCase() ===
        quizQuestion.question.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        score += points;
      }

      return {
        questionId: submitted.questionId,
        answer: submitted.answer,
        isCorrect,
        points: isCorrect ? points : 0,
      };
    });

    const updatedAttempt = await this.repo.updateAttempt(attemptId, {
      score,
      maxScore,
      answers: answerResults,
      completedAt: new Date(),
    });

    return {
      attemptId: updatedAttempt.id,
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    };
  }

  async getResult(studentId: string, quizId: string, attemptId: string) {
    const attempt = await this.repo.findAttempt(attemptId, studentId);
    if (!attempt) {
      throw AppError.notFound('Quiz attempt');
    }

    if (attempt.quizId !== quizId) {
      throw AppError.badRequest('Attempt does not belong to this quiz');
    }

    if (!attempt.completedAt) {
      throw AppError.badRequest('This attempt has not been submitted yet');
    }

    // Return with correct answers for review
    const questionsWithAnswers = attempt.quiz.questions.map((qq) => {
      const answerResult = (attempt.answers as any[])?.find(
        (a: any) => a.questionId === qq.questionId
      );

      return {
        id: qq.id,
        order: qq.order,
        question: {
          id: qq.question.id,
          type: qq.question.type,
          difficulty: qq.question.difficulty,
          content: qq.question.content,
          options: qq.question.options,
          points: qq.question.points,
          correctAnswer: qq.question.correctAnswer,
          explanation: qq.question.explanation,
        },
        studentAnswer: answerResult?.answer ?? null,
        isCorrect: answerResult?.isCorrect ?? false,
        pointsAwarded: answerResult?.points ?? 0,
      };
    });

    return {
      attemptId: attempt.id,
      quizId: attempt.quizId,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage:
        attempt.maxScore && Number(attempt.maxScore) > 0
          ? Math.round((Number(attempt.score) / Number(attempt.maxScore)) * 100)
          : 0,
      questions: questionsWithAnswers,
    };
  }
}
