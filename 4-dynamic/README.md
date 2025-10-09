# RSS app

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

### [3. Verify Services](./api-test.md)

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
