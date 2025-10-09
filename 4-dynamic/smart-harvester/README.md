# Smart Harvester Service

RSS feed harvesting service built with Node.js. Fetches articles from monitored RSS feeds and queues them for processing via Redis.

## Description

Smart Harvester is a microservice that:
- Harvests articles from RSS feeds marked as healthy in the Health Monitor
- Parses RSS/Atom feeds to extract article information
- Deduplicates articles using Redis caching
- Queues new articles to Redis for downstream processing
- Provides REST API for manual harvesting and statistics
- Runs periodic harvesting in the background

## Architecture

- **Language**: Node.js 20 (LTS)
- **Framework**: Express.js
- **Databases**: 
  - PostgreSQL (read feed status from Health Monitor)
  - Redis (article caching and queueing)
- **Port**: 3000 (configurable via `PORT` environment variable)
- **Build Type**: Multi-stage Docker build for optimized production images

## Prerequisites

### For Docker
- Docker 20.10+
- Docker Compose 2.0+ (optional, for running with databases)

### For Local Development
- Node.js 20+ (LTS)
- npm 10+
- PostgreSQL 16+ (for feed status)
- Redis 7+ (for article queue)

## Getting Started

### Option 1: Run with Docker (Standalone)

Build and run the service alone:

```bash
# Build the image
docker build -t smart-harvester .

# Run with environment variables
docker run -p 3000:3000 \
  -e POSTGRES_HOST=host.docker.internal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=feeds \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -e HARVEST_INTERVAL=60 \
  -e ALLOWED_STATUSES=green,yellow \
  smart-harvester
```

### Option 2: Run with Docker Compose

From the project root directory:

```bash
# Start all services
docker compose up -d

# Or just smart-harvester and its dependencies
docker compose up -d postgres redis smart-harvester
```

### Option 3: Run Locally Without Docker

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Set Up Databases

Make sure PostgreSQL and Redis are running:

```bash
# Check PostgreSQL
psql -U postgres -c "SELECT 1;"

# Check Redis
redis-cli ping
```

#### 3. Set Environment Variables

```bash
# Linux/Mac
export POSTGRES_HOST=localhost
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=feeds
export REDIS_HOST=localhost
export REDIS_PORT=6379
export PORT=3000
export HARVEST_INTERVAL=60
export ALLOWED_STATUSES=green,yellow

# Windows PowerShell
$env:POSTGRES_HOST="localhost"
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="postgres"
$env:POSTGRES_DB="feeds"
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:PORT="3000"
$env:HARVEST_INTERVAL="60"
$env:ALLOWED_STATUSES="green,yellow"
```

#### 4. Run the Service

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Get Statistics
```
GET /stats
```
Returns queue length, cached articles count, and configuration.

### Manual Harvest
```
POST /harvest
```
Triggers immediate harvest of all eligible feeds.

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_HOST` | PostgreSQL hostname | `postgres` | Yes |
| `POSTGRES_USER` | PostgreSQL username | `postgres` | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | Yes |
| `POSTGRES_DB` | Database name | `feeds` | Yes |
| `REDIS_HOST` | Redis hostname | `redis` | Yes |
| `REDIS_PORT` | Redis port | `6379` | No |
| `REDIS_PASSWORD` | Redis password (if auth enabled) | - | No |
| `PORT` | HTTP server port | `3000` | No |
| `HARVEST_INTERVAL` | Harvest interval in seconds | `60` | No |
| `ALLOWED_STATUSES` | Comma-separated feed statuses to harvest | `green,yellow` | No |

## How It Works

### Harvest Process

1. **Query Feeds**: Reads feeds from PostgreSQL with status in `ALLOWED_STATUSES`
2. **Parse RSS**: Fetches and parses each RSS/Atom feed
3. **Deduplicate**: Checks Redis cache to avoid processing duplicate articles
4. **Cache**: Stores article hash in Redis with 7-day TTL
5. **Queue**: Pushes new articles to `articles:queue` Redis list for processing by AI Publisher

### Data Flow

```
PostgreSQL (feeds) → Smart Harvester → Redis (articles:queue) → AI Publisher
```

## Development

### Project Structure

```
smart-harvester/
├── index.js          # Main application file
├── package.json      # Dependencies and scripts
├── Dockerfile        # Production build
├── Dockerfile.dev    # Development build
└── README.md         # This file
```

### Dependencies

- **express**: Web framework
- **pg**: PostgreSQL client
- **ioredis**: Redis client with robust error handling
- **rss-parser**: RSS/Atom feed parser
- **crypto**: Article hashing (built-in Node.js module)

### Scripts

```json
{
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

### Building

```bash
# Development
npm install

# Production
npm install --omit=dev
```

## Docker Images

### Production Image (Dockerfile)
- Multi-stage build
- Based on `node:20-alpine`
- Installs only production dependencies
- ~150MB final image size
- Runs as non-root `node` user

### Development Image (Dockerfile.dev)
- Single-stage build
- Based on `node:20-alpine`
- Includes `nodemon` for auto-reload
- Suitable for development with volume mounts

## Article Structure

Articles queued to Redis have the following structure:

```json
{
  "title": "Article Title",
  "link": "https://example.com/article",
  "pubDate": "2024-01-15T10:30:00Z",
  "content": "Article content snippet...",
  "source": "https://example.com/feed.xml",
  "hash": "md5-hash-of-article"
}
```

## Troubleshooting

### Service won't connect to databases

1. Check PostgreSQL and Redis are running:
   ```bash
   docker compose ps postgres redis
   ```

2. Verify connections:
   ```bash
   docker compose logs smart-harvester | grep -i "connected\|error"
   ```

### No articles being harvested

1. Check if feeds are marked as green/yellow in Health Monitor:
   ```bash
   curl http://localhost:8080/feeds
   ```

2. Verify `ALLOWED_STATUSES` matches feed statuses

3. Check harvest interval:
   ```bash
   curl http://localhost:3000/stats
   ```

### Redis authentication errors

If Redis requires authentication, set `REDIS_PASSWORD`:

```bash
REDIS_PASSWORD=your-redis-password
```

### Port already in use

Change the external port in `compose.yml` or `.env`:

```bash
SMART_HARVESTER_EXTERNAL_PORT=3001
```

## Performance

- Harvests feeds in sequence (not parallel) to avoid overwhelming RSS sources
- Uses MD5 hashing for fast article deduplication
- Redis cache with 7-day TTL prevents unbounded growth
- Configurable harvest interval balances freshness vs. load

## License

This is an educational project for learning Docker environment variables and dynamic compose configurations.
