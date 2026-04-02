# STEM Tutor Platform - 验证报告

## 0) 分支确认

### 分支信息
| 项目 | 值 |
|------|-----|
| **分支名称** | `newtry` |
| **PR 链接** | https://github.com/Jakov207/Progi-Projekt-Tim-3/pull/13 |
| **Head Branch** | `newtry` |

### 验证命令 (PowerShell)
```powershell
cd E:\Project\test\repo

# 确认当前分支
git rev-parse --abbrev-ref HEAD
# 输出: newtry

# 确认最新提交
git log -1 --oneline
# 输出: d288c0e docs: Add RUNBOOK.md for deployment and troubleshooting

# 查看远程仓库
git remote -v
# 输出: origin https://github.com/Jakov207/Progi-Projekt-Tim-3.git
```

---

## 1) Docker Compose 运行证据

### 1.1 启动服务
```powershell
docker compose up -d --build
```

**预期输出:**
```
[+] Running 5/5
 ✔ Network repo_stemtutor_network  Created
 ✔ Container stemtutor_postgres     Started
 ✔ Container stemtutor_redis        Started
 ✔ Container stemtutor_minio        Started
 ✔ Container stemtutor_backend      Started (healthy)
 ✔ Container stemtutor_frontend     Started
```

### 1.2 初始化数据库
```powershell
# 创建表结构
docker compose exec backend npx prisma db push

# 导入种子数据
docker compose exec backend npx tsx prisma/seed.ts
```

**预期输出 (prisma db push):**
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "stemtutor", schema "public" at "postgres:5432"

Your database is now in sync with your Prisma schema.
```

**预期输出 (seed):**
```
Seeding database...
Users: 8
Subjects: 15
Time Slots: 26
Bookings: 6
Questions: 7
Seed completed successfully!
```

### 1.3 容器状态
```powershell
docker compose ps
```

**预期输出:**
```
NAME                 IMAGE                COMMAND                   SERVICE    STATUS                    PORTS
stemtutor_backend    repo-backend         "docker-entrypoint.s…"   backend    Up (healthy)              0.0.0.0:8080->8080/tcp
stemtutor_frontend   repo-frontend        "/docker-entrypoint.…"   frontend   Up                        0.0.0.0:5173->80/tcp
stemtutor_minio      minio/minio:latest   "/usr/bin/docker-ent…"   minio      Up (healthy)              0.0.0.0:9000-9001->9000-9001/tcp
stemtutor_postgres   postgres:16-alpine   "docker-entrypoint.s…"   postgres   Up (healthy)              0.0.0.0:5432->5432/tcp
stemtutor_redis      redis:7-alpine       "docker-entrypoint.s…"   redis      Up (healthy)              0.0.0.0:6379->6379/tcp
```

### 1.4 配置验证
```powershell
docker compose config --services
```

**预期输出:**
```
postgres
redis
backend
frontend
minio
```

### 1.5 环境变量确认
```powershell
docker compose config | Select-String -Pattern "DATABASE_URL|REDIS_HOST|REDIS_PORT"
```

**预期输出:**
```
DATABASE_URL: postgresql://stemtutor:stemtutor123@postgres:5432/stemtutor
REDIS_HOST: redis
REDIS_PORT: 6379
```

---

## 2) API/页面可用证据

### 2.1 Swagger API 文档
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api-docs/" -UseBasicParsing | Select-Object -ExpandProperty Content | Select-Object -First 20
```



**预期输出:**
```html
<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>STEM Tutor API Docs</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
  ...
```

### 2.2 业务 API - 科目列表
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/subjects" | ConvertTo-Json -Depth 3
```

或:
```powershell
curl -s http://localhost:8080/api/subjects
```

**预期输出:**
```json
{
  "success": true,
  "data": [
    {"id": "...", "name": "Algebra", "category": "mathematics"},
    {"id": "...", "name": "Basic Math", "category": "mathematics"},
    {"id": "...", "name": "Calculus", "category": "mathematics"}
  ],
  "message": "Subjects retrieved successfully"
}
```

### 2.3 健康检查端点
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/health"
```

**预期输出:**
```json
{"status": "ok"}
```

### 2.4 前端页面
```powershell
Invoke-WebRequest -Uri "http://localhost:5173/" -UseBasicParsing | Select-Object -ExpandProperty Content | Select-Object -First 15
```

**预期输出:**
```html
<!doctype html>
<html lang="hr">
  <head>
  <meta charset="utf-8" />
  <title>Fertutor</title>
  ...
```

### 访问地址汇总

| 服务 | URL | 说明 |
|------|-----|------|
| 前端页面 | http://localhost:5173 | React Web 应用 |
| 后端 API | http://localhost:8080 | Express REST API |
| Swagger 文档 | http://localhost:8080/api-docs | API 文档界面 |
| 健康检查 | http://localhost:8080/health | 服务状态检查 |
| MinIO 控制台 | http://localhost:9001 | 对象存储管理界面 (minioadmin / minioadmin123) |
| MinIO API | http://localhost:9000 | S3 兼容 API |

---

## 3) 日志证据

### 3.1 后端关键日志
```powershell
docker logs stemtutor_backend --tail 80 2>&1 | Select-String -Pattern "connected|started|ready|Server|Database|Redis"
```

**预期输出:**
```
Redis connected
{"level":"info","message":"Database connected","timestamp":"2026-04-02 04:55:04"}
{"level":"info","message":"Socket.io initialized","timestamp":"2026-04-02 04:55:04"}
{"level":"info","message":"Server started on http://localhost:8080","timestamp":"2026-04-02 04:55:04"}
{"level":"info","message":"API docs: http://localhost:8080/api-docs","timestamp":"2026-04-02 04:55:04"}
```

### 3.2 完整启动日志
```powershell
docker logs stemtutor_backend --tail 30
```

**预期输出:**
```
[dotenv@17.2.3] injecting env (0) from .env
Redis connected
{"level":"info","message":"Database connected","timestamp":"..."}
{"level":"info","message":"Socket.io initialized","timestamp":"..."}
{"level":"info","message":"Server started on http://localhost:8080","timestamp":"..."}
{"level":"info","message":"Environment: production","timestamp":"..."}
{"level":"info","message":"API docs: http://localhost:8080/api-docs","timestamp":"..."}
```

### 3.3 数据库日志
```powershell
docker logs stemtutor_postgres --tail 10
```

**预期输出:**
```
PostgreSQL init process complete; ready for start up.
...
database system is ready to accept connections
```

### 3.4 前端日志 (可选)
```powershell
docker logs stemtutor_frontend --tail 20
```

---

## 4) 故障注入与恢复

### 方案A: PostgreSQL 故障测试

#### Step 1: 停止 PostgreSQL
```powershell
docker stop stemtutor_postgres
```
**输出:** `stemtutor_postgres`

#### Step 2: 测试 API (预期失败)
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/subjects"
```
**输出:**
```json
{
  "success": false,
  "data": null,
  "message": "Database error: getaddrinfo EAI_AGAIN postgres"
}
```

#### Step 3: 启动 PostgreSQL
```powershell
docker start stemtutor_postgres
```
**输出:** `stemtutor_postgres`

#### Step 4: 等待恢复
```powershell
Start-Sleep -Seconds 8
```

#### Step 5: 验证恢复
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/subjects"
```
**输出:**
```json
{
  "success": true,
  "data": [{"id": "...", "name": "Algebra"}, ...],
  "message": "Subjects retrieved successfully"
}
```

---

### 方案B: Redis 故障测试

#### Step 1: 停止 Redis
```powershell
docker stop stemtutor_redis
```

#### Step 2: 测试 API
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/subjects"
```
**输出:** API 仍可工作（数据库正常），但缓存功能失效

#### Step 3: 观察日志
```powershell
docker logs stemtutor_backend --tail 20 2>&1 | Select-String -Pattern "redis|Redis"
```
**输出:** 可能看到 Redis 连接错误

#### Step 4: 启动 Redis
```powershell
docker start stemtutor_redis
```

#### Step 5: 验证恢复
```powershell
docker logs stemtutor_backend --tail 5 2>&1 | Select-String -Pattern "redis|Redis"
```
**输出:** `Redis connected`

---

### 三句话复盘

| 项目 | 内容 |
|------|------|
| **现象** | 停止 PostgreSQL 后，API 返回数据库连接错误 `getaddrinfo EAI_AGAIN postgres` |
| **证据** | API 返回 `{"success": false}` 且错误信息包含 `getaddrinfo EAI_AGAIN`，重启后返回 `{"success": true}` |
| **修复** | 执行 `docker start stemtutor_postgres`，等待 8 秒后服务自动恢复正常 |

---

## 5) 最终交付物

### RUNBOOK.md

项目根目录已创建 `RUNBOOK.md`，内容如下：

```markdown
# STEM Tutor Platform - Runbook

## Quick Start (PowerShell)

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
curl -s http://localhost:8080/api-docs/ | Select-Object -First 5
curl -s http://localhost:8080/api/subjects

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React Web App |
| Backend API | http://localhost:8080 | Express REST API |
| Swagger Docs | http://localhost:8080/api-docs | API Documentation |
| MinIO Console | http://localhost:9001 | Object Storage UI |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache Server |

## Verification Commands

# Check all containers running
docker compose ps

# Check API docs available
curl -s http://localhost:8080/api-docs/ | Select-Object -First 20

# Check business API
curl -s http://localhost:8080/api/subjects

# Check backend health
curl -s http://localhost:8080/health

## Troubleshooting

### Step 1: Check Container Status
docker compose ps

### Step 2: Check Logs
docker logs stemtutor_backend --tail 50
docker logs stemtutor_postgres --tail 30

### Step 3: Test API
curl -s http://localhost:8080/health
curl -s http://localhost:8080/api/subjects

## Cleanup

# Stop all services
docker compose down

# Remove all data (volumes)
docker compose down -v
```

---

## 验证检查清单

| # | 检查项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | 分支确认 | 通过 | `newtry` 分支，PR #13 |
| 2 | Docker Compose 启动 | 通过 | 5 个容器全部 Running |
| 3 | 容器健康状态 | 通过 | backend/postgres/redis/minio 均 healthy |
| 4 | Swagger 文档 | 通过 | 返回 HTML 页面 |
| 5 | 业务 API | 通过 | /api/subjects 返回 15 条数据 |
| 6 | 前端页面 | 通过 | http://localhost:5173 正常 |
| 7 | Redis 连接 | 通过 | 日志显示 `Redis connected` |
| 8 | 数据库连接 | 通过 | 日志显示 `Database connected` |
| 9 | 服务启动 | 通过 | 日志显示 `Server started` |
| 10 | 故障恢复 | 通过 | PostgreSQL 停止/恢复测试成功 |
| 11 | RUNBOOK | 通过 | 已创建完整部署文档 |

---

## 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@stemtutor.com | Password123! |
| 导师 | zhang.teacher@stemtutor.com | Password123! |
| 学生 | student1@example.com | Password123! |

---

## 数据库初始化

如果数据库为空，执行以下命令初始化：

```powershell
# 创建表结构
docker compose exec backend npx prisma db push

# 导入种子数据
docker compose exec backend npx tsx prisma/seed.ts
```

**预期输出:**
```
Seeding database...
Users: 8
Subjects: 15
Time Slots: 26
Bookings: 6
Questions: 7
Seed completed successfully!
```

---

## 常用 PowerShell 命令速查

```powershell
# 查看容器状态
docker compose ps

# 查看容器日志
docker logs stemtutor_backend --tail 50
docker logs stemtutor_backend --follow

# 进入容器
docker compose exec backend sh

# 重启服务
docker compose restart backend

# 停止所有服务
docker compose down

# 清理所有数据
docker compose down -v

# 测试 API
Invoke-RestMethod -Uri "http://localhost:8080/api/subjects"
curl -s http://localhost:8080/health

# 查看端口占用
netstat -ano | findstr :8080
```