import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { disconnectRedis } from './config/redis';
import { logger } from './config/logger';

const PORT = env.PORT;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server started on http://localhost:${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`API docs: http://localhost:${PORT}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        await disconnectRedis();
        logger.info('Server shut down');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
