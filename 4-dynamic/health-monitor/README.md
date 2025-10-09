# Health Monitor Service

RSS feed health monitoring service built with Go. Monitors RSS feed availability, tracks response times, and stores feed health metrics in PostgreSQL.

## Description

Health Monitor is a microservice that:
- Tracks RSS feed health status (green/yellow/red based on availability and response time)
- Monitors feed latency and availability
- Provides REST API for feed management
- Stores feed data and metrics in PostgreSQL
- Runs periodic health checks in the background

## Architecture

- **Language**: Go 1.23
- **Database**: PostgreSQL
- **Port**: 8080 (configurable via `PORT` environment variable)
- **Build Type**: Multi-stage Docker build for optimized production images

## Prerequisites

### For Docker
- Docker 20.10+
- Docker Compose 2.0+ (optional, for running with databases)

### For Local Development
- Go 1.23+
- PostgreSQL 16+
- Make (optional)

## Getting Started

### Option 1: Run with Docker (Standalone)

Build and run the service alone:

```bash
# Build the image
docker build -t health-monitor .

# Run with environment variables
docker run -p 8080:8080 \
  -e POSTGRES_HOST=host.docker.internal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=feeds \
  -e CHECK_INTERVAL=30s \
  health-monitor
```

### Option 2: Run with Docker Compose

From the project root directory:

```bash
# Start all services
docker compose up -d

# Or just health-monitor and its dependencies
docker compose up -d postgres health-monitor
```

### Option 3: Run Locally Without Docker

#### 1. Install Dependencies

```bash
go mod download
```

#### 2. Set Up PostgreSQL

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE feeds;
```

#### 3. Set Environment Variables

```bash
# Linux/Mac
export POSTGRES_HOST=localhost
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_DB=feeds
export PORT=8080
export CHECK_INTERVAL=30s

# Windows PowerShell
$env:POSTGRES_HOST="localhost"
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="postgres"
$env:POSTGRES_DB="feeds"
$env:PORT="8080"
$env:CHECK_INTERVAL="30s"
```

#### 4. Run the Service

```bash
# Development mode (with auto-reload if using air)
go run main.go

# Or build and run
go build -o health-monitor
./health-monitor  # Linux/Mac
.\health-monitor.exe  # Windows
```

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Add Feed
```
POST /feeds/add
Content-Type: application/json

{
  "url": "https://example.com/feed.xml"
}
```

### List All Feeds
```
GET /feeds
```
Returns all monitored feeds with their status.

### Get Metrics
```
GET /metrics
```
Returns aggregated metrics grouped by feed status.

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_HOST` | PostgreSQL hostname | `postgres` | Yes |
| `POSTGRES_USER` | PostgreSQL username | `postgres` | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | Yes |
| `POSTGRES_DB` | Database name | `feeds` | Yes |
| `PORT` | HTTP server port | `8080` | No |
| `CHECK_INTERVAL` | Health check interval | `30s` | No |

## Database Schema

### feeds table
```sql
CREATE TABLE IF NOT EXISTS feeds (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    last_check TIMESTAMP,
    latency_ms INTEGER,
    error_message TEXT
);
```

## Development

### Project Structure

```
health-monitor/
├── main.go           # Main application file
├── Dockerfile        # Production build
├── Dockerfile.dev    # Development build
├── go.mod           # Go dependencies
├── go.sum           # Dependency checksums
└── README.md        # This file
```

### Building

```bash
# Development build
go build -o health-monitor

# Production build (static binary)
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o health-monitor .
```

### Testing

```bash
# Run tests
go test ./...

# Run with coverage
go test -cover ./...
```

## Docker Images

### Production Image (Dockerfile)
- Multi-stage build
- Based on `golang:1.23-alpine` for building
- Final image based on `alpine:latest`
- ~10-15MB final image size
- Includes only the compiled binary and ca-certificates

### Development Image (Dockerfile.dev)
- Single-stage build
- Based on `golang:1.23-alpine`
- Includes full Go toolchain
- Suitable for development with volume mounts

## Health Check Logic

The service categorizes feeds into three statuses:

- **Green**: Feed is accessible and response time < 1000ms
- **Yellow**: Feed is accessible but response time >= 1000ms
- **Red**: Feed is not accessible or returns an error

Health checks run every `CHECK_INTERVAL` (default: 30 seconds).

## Troubleshooting

### Service won't connect to PostgreSQL

1. Check PostgreSQL is running:
   ```bash
   docker compose ps postgres
   ```

2. Verify connection string:
   ```bash
   docker compose logs health-monitor | grep -i postgres
   ```

3. Test database connectivity:
   ```bash
   docker compose exec postgres psql -U postgres -d feeds -c "SELECT 1;"
   ```

### Health checks not running

Check the `CHECK_INTERVAL` environment variable and service logs:

```bash
docker compose logs health-monitor --tail=50
```

### Port already in use

Change the external port in `compose.yml` or `.env`:

```bash
HEALTH_MONITOR_EXTERNAL_PORT=8081
```

## License

This is an educational project for learning Docker environment variables and dynamic compose configurations.
