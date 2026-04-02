# STEM Tutor Platform - Installation Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Installation](#manual-installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### For Docker Installation
- Docker Desktop 4.0+ (includes Docker Compose)
- Git

### For Manual Installation
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- npm or yarn

## Quick Start with Docker

### 1. Clone the repository
```bash
git clone https://github.com/your-org/stem-tutor-platform.git
cd stem-tutor-platform
```

### 2. Create environment file
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DB_USER=stemtutor
DB_PASSWORD=your_secure_password
DB_NAME=stemtutor

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Stripe (optional for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Start all services
```bash
docker-compose up -d
```

### 4. Run database migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Documentation: http://localhost:8080/api-docs
- MinIO Console: http://localhost:9001

## Manual Installation

### Backend Setup

1. **Install dependencies**
```bash
cd app/server
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup database**
```bash
# Create PostgreSQL database
createdb stemtutor

# Run migrations
npx prisma migrate deploy

# (Optional) Seed initial data
npx prisma db seed
```

4. **Start development server**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies**
```bash
cd app/client
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API URL and public keys
```

3. **Start development server**
```bash
npm run dev
```

## Environment Variables

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_SECRET` | Yes | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens |
| `FRONTEND_URL` | Yes | CORS allowed origin |
| `STRIPE_SECRET_KEY` | No | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP server port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_STRIPE_PUBLIC_KEY` | No | Stripe publishable key |

## Database Setup

### Initial Migration
```bash
cd app/server
npx prisma migrate dev --name init
```

### Seed Data
```bash
npx prisma db seed
```

### Reset Database (Development)
```bash
npx prisma migrate reset
```

## Running the Application

### Development Mode

**Backend:**
```bash
cd app/server
npm run dev
```

**Frontend:**
```bash
cd app/client
npm run dev
```

### Production Mode

**Using Docker:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Manual Build:**
```bash
# Backend
cd app/server
npm run build
npm start

# Frontend
cd app/client
npm run build
# Serve with nginx or similar
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Ensure PostgreSQL is running and credentials are correct.

#### Redis Connection Error
```
Error: Redis connection failed
```
**Solution:** Check Redis is running: `redis-cli ping`

#### JWT Secret Too Short
```
Error: Secret must be at least 32 characters
```
**Solution:** Use a longer secret or generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Prisma Client Not Generated
```
Error: Cannot find module '@prisma/client'
```
**Solution:** Run `npx prisma generate`

#### Docker Port Conflicts
```
Error: port is already allocated
```
**Solution:** Stop conflicting services or change ports in docker-compose.yml:
```yaml
ports:
  - "5433:5432"  # Change host port
```

### Logs

**Docker logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Application logs:**
- Backend logs are written to `logs/` directory
- Use `LOG_LEVEL=debug` for verbose logging

### Health Checks

Check service health:
```bash
# Backend health
curl http://localhost:8080/health

# Database connection
docker-compose exec backend npx prisma db push --skip-generate

# Redis connection
docker-compose exec backend node -e "const redis = require('redis'); const c = redis.createClient({url: process.env.REDIS_URL}); c.connect().then(() => console.log('OK'))"
```

## Support

For issues and feature requests, please create an issue on GitHub.