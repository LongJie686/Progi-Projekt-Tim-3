# STEM Tutor Platform - Runbook

## Quick Start

```bash
# 1. Clone and checkout
git clone https://github.com/Jakov207/Progi-Projekt-Tim-3.git
cd Progi-Projekt-Tim-3
git checkout newtry

# 2. Start all services
docker compose up -d --build

# 3. Initialize database
docker compose exec backend npx prisma db push
docker compose exec backend npx tsx prisma/seed.ts

# 4. Verify
docker compose ps
curl -s http://localhost:8080/api-docs/ | head -5
curl -s http://localhost:8080/api/subjects
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React Web App |
| Backend API | http://localhost:8080 | Express REST API |
| Swagger Docs | http://localhost:8080/api-docs | API Documentation |
| MinIO Console | http://localhost:9001 | Object Storage UI |
| MinIO API | http://localhost:9000 | S3-compatible API |
| PostgreSQL | localhost:5432 | Database (stemtutor / stemtutor123) |
| Redis | localhost:6379 | Cache Server |

## Verification Commands

```bash
# Check all containers running
docker compose ps

# Check API docs available
curl -s http://localhost:8080/api-docs/ | head -20

# Check business API
curl -s http://localhost:8080/api/subjects

# Check backend health
curl -s http://localhost:8080/health
```

## Troubleshooting

### Step 1: Check Container Status
```bash
docker compose ps
```
All containers should show `Up` or `Up (healthy)`.

### Step 2: Check Logs
```bash
# Backend logs
docker logs stemtutor_backend --tail 50

# Frontend logs
docker logs stemtutor_frontend --tail 30

# Database logs
docker logs stemtutor_postgres --tail 30
```

### Step 3: Test API
```bash
curl -s http://localhost:8080/health
curl -s http://localhost:8080/api/subjects
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `docker compose down` then `docker compose up -d` |
| Database not ready | Wait 10s, or check `docker logs stemtutor_postgres` |
| API returns 500 | Check `docker logs stemtutor_backend` for errors |
| Prisma client error | Run `docker compose exec backend npx prisma generate` |

## Cleanup

```bash
# Stop all services
docker compose down

# Remove all data (volumes)
docker compose down -v

# Remove images
docker compose down --rmi all
```

## Architecture

```
                    ┌─────────────┐
                    │  Frontend   │ :5173 (nginx)
                    │   (React)   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Backend   │ :8080 (Express)
                    │  (Node.js)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│   PostgreSQL  │  │     Redis     │  │     MinIO     │
│     :5432     │  │     :6379     │  │  :9000-9001   │
└───────────────┘  └───────────────┘  └───────────────┘
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stemtutor.com | Password123! |
| Tutor | zhang.teacher@stemtutor.com | Password123! |
| Student | student1@example.com | Password123! |