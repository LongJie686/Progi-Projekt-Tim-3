import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class SocketService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: env.FRONTEND_URL,
        credentials: true,
      },
      path: '/socket.io',
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('Socket.io initialized');
  }

  private setupMiddleware() {
    if (!this.io) return;

    this.io.use(async (socket: AuthSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthSocket) => {
      const userId = socket.userId!;
      logger.debug('Socket connected', { userId, socketId: socket.id });

      // Track user sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Handle joining booking rooms
      socket.on('join-booking', (bookingId: string) => {
        socket.join(`booking:${bookingId}`);
        logger.debug('Socket joined booking room', { userId, bookingId });
      });

      // Handle leaving booking rooms
      socket.on('leave-booking', (bookingId: string) => {
        socket.leave(`booking:${bookingId}`);
      });

      // Handle video session signaling
      socket.on('video-signal', (data: { bookingId: string; signal: any; to: string }) => {
        socket.to(`user:${data.to}`).emit('video-signal', {
          from: userId,
          signal: data.signal,
        });
      });

      // Handle chat messages
      socket.on('chat-message', async (data: { bookingId: string; message: string }) => {
        try {
          const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId },
            select: { studentId: true, tutorId: true },
          });

          if (!booking) return;

          // Save message to Redis (temporary, can be persisted)
          const messageData = {
            id: Date.now().toString(),
            bookingId: data.bookingId,
            senderId: userId,
            message: data.message,
            timestamp: new Date().toISOString(),
          };

          await redis.lpush(`chat:${data.bookingId}`, JSON.stringify(messageData));
          await redis.ltrim(`chat:${data.bookingId}`, 0, 99); // Keep last 100 messages

          // Broadcast to booking room
          this.io?.to(`booking:${data.bookingId}`).emit('chat-message', messageData);
        } catch (error) {
          logger.error('Error handling chat message', { error, userId, bookingId: data.bookingId });
        }
      });

      // Handle whiteboard updates
      socket.on('whiteboard-update', (data: { bookingId: string; elements: any[] }) => {
        socket.to(`booking:${data.bookingId}`).emit('whiteboard-update', {
          userId,
          elements: data.elements,
        });
      });

      // Handle typing indicator
      socket.on('typing-start', (bookingId: string) => {
        socket.to(`booking:${bookingId}`).emit('user-typing', { userId });
      });

      socket.on('typing-stop', (bookingId: string) => {
        socket.to(`booking:${bookingId}`).emit('user-stopped-typing', { userId });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.debug('Socket disconnected', { userId, socketId: socket.id });

        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });
    });
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any) {
    this.io?.to(`user:${userId}`).emit('notification', notification);
  }

  // Send notification to all users in a role
  sendToRole(role: string, event: string, data: any) {
    // This would require tracking user roles - for now we'll use direct user IDs
    this.io?.emit(event, data);
  }

  // Broadcast to booking room
  broadcastToBooking(bookingId: string, event: string, data: any) {
    this.io?.to(`booking:${bookingId}`).emit(event, data);
  }

  // Get online users
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return !!sockets && sockets.size > 0;
  }

  getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();