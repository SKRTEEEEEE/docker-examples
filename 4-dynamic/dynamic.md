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