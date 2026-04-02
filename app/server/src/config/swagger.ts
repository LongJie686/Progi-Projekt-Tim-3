import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express, Request, Response } from 'express';
import { env } from '../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'STEM Tutor Platform API',
      version: '1.0.0',
      description: 'API documentation for STEM Tutor Platform - connecting students with STEM tutors',
      contact: {
        name: 'API Support',
        email: 'support@stemtutor.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['STUDENT', 'TUTOR', 'ADMIN'] },
            avatarUrl: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Tutor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            bio: { type: 'string', nullable: true },
            education: { type: 'object', nullable: true },
            hourlyRate60: { type: 'number', nullable: true },
            location: { type: 'string', nullable: true },
            isVerified: { type: 'boolean' },
            avgRating: { type: 'number' },
            totalReviews: { type: 'integer' },
            totalSessions: { type: 'integer' }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            bookingDate: { type: 'string', format: 'date' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            format: { type: 'string', enum: ['online', 'in_person'] },
            status: { type: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] },
            price: { type: 'number', nullable: true },
            notes: { type: 'string', nullable: true },
            meetUrl: { type: 'string', nullable: true }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            communication: { type: 'integer', nullable: true },
            expertise: { type: 'integer', nullable: true },
            preparation: { type: 'integer', nullable: true },
            value: { type: 'integer', nullable: true },
            comment: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Tutors', description: 'Tutor search and profiles' },
      { name: 'Bookings', description: 'Session booking management' },
      { name: 'Payments', description: 'Stripe payment integration' },
      { name: 'Reviews', description: 'Tutor reviews and ratings' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Subjects', description: 'Academic subjects' },
      { name: 'Admin', description: 'Administrative operations' }
    ]
  },
  apis: ['./src/modules/*/routes.ts', './src/modules/*/dto.ts']
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'STEM Tutor API Docs'
  }));

  // API spec as JSON
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}