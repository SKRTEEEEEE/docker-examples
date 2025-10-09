# Module 4: Environment Variables and Dynamic Docker Compose

## 🎯 Learning Objectives

This module teaches you how to:
- Use **environment variables** in Docker Compose and Dockerfiles
- Manage configuration with **`.env` files**
- Implement **restart policies** for containers
- Create **dynamic compose setups** for different environments (development vs production)

---

## 📚 Core Concepts

### 1. Environment Variables in Docker

Environment variables allow you to configure containers without hardcoding values in your code or images.

**Why use environment variables?**
- **Flexibility**: Same image works in different environments
- **Security**: Keep secrets out of source code
- **Portability**: Easy to reconfigure containers

**Setting environment variables:**

```yaml
# In compose.yml
services:
  app:
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
```

```dockerfile
# In Dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

**Accessing environment variables in code:**

```go
// Go
dbHost := os.Getenv("DB_HOST")
```

```javascript
// Node.js
const dbHost = process.env.DB_HOST;
```

```python
# Python
import os
db_host = os.getenv('DB_HOST', 'default_value')
```

---

### 2. .env Files

`.env` files centralize environment configuration, making it easy to manage multiple environments.

**Basic `.env` file:**

```bash
# Database Configuration
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb

# Application Settings
APP_PORT=3000
DEBUG_MODE=true
```

**Using `.env` in compose.yml:**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

**Loading specific env files:**

```bash
# Load default .env
docker compose up

# Load specific env file
docker compose --env-file .env.prod up

# Load multiple env files
docker compose --env-file .env --env-file .env.local up
```

---

### 3. Restart Policies

Restart policies control when Docker automatically restarts containers after they stop or crash.

**Available policies:**

| Policy | Behavior |
|--------|----------|
| `no` | Never restart (default) |
| `always` | Always restart, even after Docker daemon restart |
| `on-failure` | Restart only if container exits with error code |
| `unless-stopped` | Always restart unless manually stopped |

**Examples:**

```yaml
services:
  # Development: don't restart (manual control)
  dev-app:
    restart: no
  
  # Production: always keep running
  prod-app:
    restart: always
  
  # Restart on crashes only
  worker:
    restart: on-failure
  
  # Production with manual control option
  api:
    restart: unless-stopped
```

**Using restart policy with max retries:**

```yaml
services:
  app:
    restart: on-failure:5  # Retry max 5 times
```

---

### 4. Dynamic Compose Configuration

Create different setups for development and production by leveraging environment variables.

**Strategy 1: Single compose.yml with .env files**

```yaml
# compose.yml
services:
  app:
    build:
      dockerfile: ${APP_DOCKERFILE:-Dockerfile}  # Default to Dockerfile
    environment:
      NODE_ENV: ${NODE_ENV}
    restart: ${RESTART_POLICY:-unless-stopped}
    volumes:
      - ${APP_VOLUME:-app_data}:/app
```

**.env.dev:**
```bash
APP_DOCKERFILE=Dockerfile.dev
NODE_ENV=development
RESTART_POLICY=no
APP_VOLUME=./src  # Mount source code for live reload
```

**.env.prod:**
```bash
APP_DOCKERFILE=Dockerfile
NODE_ENV=production
RESTART_POLICY=always
APP_VOLUME=app_data  # Use named volume
```

**Running different environments:**

```bash
# Development
docker compose --env-file .env.dev up

# Production
docker compose --env-file .env.prod up -d
```

**Strategy 2: Compose override files**

```bash
# Base configuration
docker-compose.yml

# Development overrides
docker-compose.override.yml  # Auto-loaded

# Production overrides
docker-compose.prod.yml
```

```bash
# Development (automatic)
docker compose up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

## 🖥️ Platform-Specific Commands

### Docker Commands

**Basic operations:**

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# With specific env file
docker compose --env-file .env.prod up -d

# Build and start
docker compose up --build

# Stop services
docker compose down

# View logs
docker compose logs <service-name>

# View environment variables
docker compose config
```

### Windows Bash (Git Bash, WSL) vs Linux

**Key differences:**

| Command | Linux | Windows Bash |
|---------|-------|--------------|
| Line endings | LF (`\n`) | CRLF (`\r\n`) may cause issues |
| Path mounting | `/home/user/app` | `/c/Users/user/app` or `C:\Users\user\app` |
| File permissions | Full support | Limited (no execute bit) |

**Windows-specific considerations:**

```bash
# Windows paths in compose.yml
volumes:
  - C:\Users\user\data:/app/data  # Windows style
  - /c/Users/user/data:/app/data  # Git Bash style
  
# Line ending issues: use .gitattributes
* text=auto
*.sh text eol=lf
```

### Podman vs Docker

**Podman is a daemonless Docker alternative that's mostly compatible:**

```bash
# Docker commands
docker compose up
docker build -t myimage .
docker run myimage

# Podman equivalent
podman-compose up
podman build -t myimage .
podman run myimage
```

**Key differences:**

| Feature | Docker | Podman |
|---------|--------|--------|
| Daemon | Requires `dockerd` | Daemonless |
| Root | Runs as root | Rootless by default |
| Compose | `docker compose` | `podman-compose` (separate install) |
| Socket | `/var/run/docker.sock` | User socket or emulation |

**Podman-specific notes:**

```bash
# Enable rootless mode
podman machine init
podman machine start

# Alias for Docker compatibility
alias docker=podman
alias docker-compose=podman-compose

# Generate systemd services
podman generate systemd mycontainer
```

---

## 🏗️ Project Structure

This project demonstrates a **3-microservice RSS aggregator** with dynamic configuration:

```
4-dynamic/
├── health-monitor/        # Go service - monitors feed health
│   ├── main.go
│   ├── Dockerfile        # Production build
│   ├── Dockerfile.dev    # Development build
│   ├── go.mod
│   └── go.sum
├── smart-harvester/       # Node.js service - harvests RSS feeds
│   ├── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
├── ai-publisher/          # Python service - AI content processing
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── Dockerfile.dev
├── compose.yml            # Main compose file (dynamic)
├── .env                   # Default environment (dev)
├── .env.dev              # Development configuration
└── .env.prod             # Production configuration
```

---

## 🚀 Getting Started

### 1. Start in Development Mode

```bash
# Uses .env (development by default)
docker compose up --build

# Or explicitly specify dev env
docker compose --env-file .env.dev up --build
```

**Development features:**
- Hot reload (source code mounted as volumes)
- No restart policy (manual control)
- Debug logging enabled
- Faster builds with `Dockerfile.dev`

### 2. Start in Production Mode

```bash
# Use production environment
docker compose --env-file .env.prod up -d --build
```

**Production features:**
- Optimized multi-stage builds
- Always restart policy
- Minimal logging
- No source code mounted
- Smaller image sizes

### 3. Verify Services

```bash
# Check all containers are running
docker compose ps

# Add a feed to monitor
curl -X POST http://localhost:8080/feeds/add \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com/rss"}'

# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/feeds/add" `
  -Method POST -ContentType "application/json" `
  -Body '{"url":"https://news.ycombinator.com/rss"}'

# Check feed status
curl http://localhost:8080/feeds

# Check metrics
curl http://localhost:8080/metrics

# Check harvester stats
curl http://localhost:3000/stats

# Check AI publisher stats
curl http://localhost:5000/stats
```

---

## 🔑 Environment Variable Reference

### Global Variables

| Variable | Description | Dev Value | Prod Value |
|----------|-------------|-----------|------------|
| `RESTART_POLICY` | Container restart policy | `no` | `always` |

### Database Configuration

**PostgreSQL:**
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `POSTGRES_PORT`: External port (default: 5432)

**Redis:**
- `REDIS_PASSWORD`: Redis password
- `REDIS_PORT`: External port (default: 6379)

**MongoDB:**
- `MONGO_USER`: MongoDB root user
- `MONGO_PASSWORD`: MongoDB root password
- `MONGO_DB`: Database name
- `MONGO_PORT`: External port (default: 27017)

### Service Configuration

**Health Monitor (Go):**
- `HEALTH_MONITOR_DOCKERFILE`: Which Dockerfile to use
- `HEALTH_MONITOR_PORT`: Internal port
- `HEALTH_MONITOR_EXTERNAL_PORT`: External port
- `CHECK_INTERVAL`: How often to check feeds (e.g., `30s`, `1m`)

**Smart Harvester (Node.js):**
- `SMART_HARVESTER_DOCKERFILE`: Which Dockerfile to use
- `SMART_HARVESTER_PORT`: Internal port
- `HARVEST_INTERVAL`: Harvest interval in seconds
- `ALLOWED_STATUSES`: Which feed statuses to harvest (e.g., `green,yellow`)

**AI Publisher (Python):**
- `AI_PUBLISHER_DOCKERFILE`: Which Dockerfile to use
- `AI_PUBLISHER_PORT`: Internal port

---

## 📖 Practical Examples

### Example 1: Override Single Variable

```bash
# Override just the restart policy
RESTART_POLICY=always docker compose up -d
```

### Example 2: Custom Environment File

```bash
# Create custom staging environment
cp .env.dev .env.staging
# Edit .env.staging to tweak values
docker compose --env-file .env.staging up
```

### Example 3: Inspect Resolved Configuration

```bash
# See final configuration with env vars resolved
docker compose --env-file .env.prod config

# Save resolved config
docker compose config > resolved-compose.yml
```

### Example 4: Scale Services

```bash
# Scale harvester to 3 instances
docker compose up -d --scale smart-harvester=3
```

### Example 5: Override in Command

```bash
# Override environment in command
docker compose run -e DEBUG=true smart-harvester npm test
```

---

## 🛠️ Development Workflow

### Typical Development Cycle

```bash
# 1. Start development environment
docker compose up

# 2. Make code changes (auto-reload in dev mode)

# 3. View logs
docker compose logs -f smart-harvester

# 4. Run tests in container
docker compose exec smart-harvester npm test

# 5. Rebuild specific service
docker compose up -d --build smart-harvester

# 6. Stop everything
docker compose down
```

### Debugging

```bash
# Shell into container
docker compose exec health-monitor sh

# View environment variables
docker compose exec health-monitor env

# Check database connection
docker compose exec postgres psql -U postgres -d feeds -c "\dt"

# View real-time logs
docker compose logs -f --tail=100
```

---

## 🎓 Key Takeaways

1. **Environment variables** make containers configurable and portable
2. **`.env` files** centralize configuration management
3. **Restart policies** ensure service availability in production
4. **Dynamic compose** allows one setup for multiple environments
5. Use `Dockerfile.dev` for development with hot reload
6. Use optimized `Dockerfile` (multi-stage) for production
7. Always use specific `.env` files for production deployments
8. Test configuration with `docker compose config` before deploying

---

## 📝 Best Practices

✅ **DO:**
- Use `.env` files for configuration
- Keep secrets in `.env.local` (never commit!)
- Use `restart: unless-stopped` for production
- Use multi-stage builds for smaller images
- Document all environment variables
- Use health checks with restart policies

❌ **DON'T:**
- Hardcode secrets in Dockerfiles or compose.yml
- Commit `.env.prod` with real secrets
- Use `restart: always` in development
- Mount source code volumes in production
- Use `latest` tags in production

---

## 🔗 Related Modules

- **Module 2**: Dockerfile basics and multi-stage builds
- **Module 3**: Docker networks and communication
- **Module 5**: Docker volumes and data persistence

---

## 🏁 Exercise Complete!

You've learned how to:
✓ Configure services with environment variables  
✓ Use `.env` files for different environments  
✓ Implement restart policies  
✓ Create dynamic compose setups for dev and prod  
✓ Build a multi-service application with proper configuration management  

**Next Steps:**
- Experiment with different environment configurations
- Create your own `.env.staging` file
- Try switching between dev and prod modes
- Explore volume mounting differences between environments
