import { z } from 'zod';

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subjectId: z.string().min(1, 'Subject ID is required'),
  timeLimit: z.number().int().positive().optional(),
  questions: z.array(
    z.object({
      questionId: z.string().min(1, 'Question ID is required'),
      order: z.number().int().min(0, 'Order must be non-negative'),
    })
  ).min(1, 'At least one question is required'),
});

export const quizFilterSchema = z.object({
  subjectId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1, 'Question ID is required'),
      answer: z.string().min(1, 'Answer is required'),
    })
  ).min(1, 'At least one answer is required'),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuizFilterInput = z.infer<typeof quizFilterSchema>;
export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>;
