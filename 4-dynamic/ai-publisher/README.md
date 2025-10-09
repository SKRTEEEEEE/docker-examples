# AI Publisher Service

AI-powered article classification and publishing service built with Python/Flask. Processes articles from the Redis queue, classifies them using keyword matching, and stores results in MongoDB.

## Description

AI Publisher is a microservice that:
- Consumes articles from Redis queue populated by Smart Harvester
- Classifies articles using simple keyword-based AI simulation
- Stores classified articles in MongoDB
- Manages publishing rules and categories
- Provides REST API for querying articles and statistics
- Runs background worker for continuous processing

## Architecture

- **Language**: Python 3.11
- **Framework**: Flask (with Gunicorn in production)
- **Databases**:
  - Redis (article queue consumer)
  - MongoDB (classified articles storage)
- **Port**: 5000 (configurable via `PORT` environment variable)
- **Build Type**: Multi-stage Docker build for optimized production images

## Prerequisites

### For Docker
- Docker 20.10+
- Docker Compose 2.0+ (optional, for running with databases)

### For Local Development
- Python 3.11+
- pip
- Redis 7+ (for article queue)
- MongoDB 7+ (for articles storage)

## Getting Started

### Option 1: Run with Docker (Standalone)

Build and run the service alone:

```bash
# Build the image
docker build -t ai-publisher .

# Run with environment variables
docker run -p 5000:5000 \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -e MONGO_HOST=host.docker.internal \
  -e MONGO_PORT=27017 \
  -e MONGO_USER=root \
  -e MONGO_PASSWORD=example \
  -e MONGO_DB=articles \
  ai-publisher
```

### Option 2: Run with Docker Compose

From the project root directory:

```bash
# Start all services
docker compose up -d

# Or just ai-publisher and its dependencies
docker compose up -d redis mongodb ai-publisher
```

### Option 3: Run Locally Without Docker

#### 1. Create Virtual Environment

```bash
# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Set Up Databases

Make sure Redis and MongoDB are running:

```bash
# Check Redis
redis-cli ping

# Check MongoDB
mongosh --eval "db.version()"
```

#### 4. Set Environment Variables

```bash
# Linux/Mac
export REDIS_HOST=localhost
export REDIS_PORT=6379
export MONGO_HOST=localhost
export MONGO_PORT=27017
export MONGO_USER=root
export MONGO_PASSWORD=example
export MONGO_DB=articles
export PORT=5000

# Windows PowerShell
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:MONGO_HOST="localhost"
$env:MONGO_PORT="27017"
$env:MONGO_USER="root"
$env:MONGO_PASSWORD="example"
$env:MONGO_DB="articles"
$env:PORT="5000"
```

#### 5. Run the Service

```bash
# Development mode (Flask debug server)
python app.py

# Production mode (with Gunicorn)
gunicorn --bind 0.0.0.0:5000 --workers 2 app:app
```

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status.

### Get Articles
```
GET /articles
GET /articles?category=technology
GET /articles?limit=20
```
Returns classified articles from MongoDB. Supports filtering by category and limiting results.

### Get Statistics
```
GET /stats
```
Returns processing statistics: total articles, articles by category, and queue status.

### Get Classification Rules
```
GET /rules
```
Returns current AI classification rules (keywords for each category).

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REDIS_HOST` | Redis hostname | `redis` | Yes |
| `REDIS_PORT` | Redis port | `6379` | No |
| `REDIS_PASSWORD` | Redis password (if auth enabled) | - | No |
| `MONGO_HOST` | MongoDB hostname | `mongodb` | Yes |
| `MONGO_PORT` | MongoDB port | `27017` | No |
| `MONGO_USER` | MongoDB username | `root` | Yes |
| `MONGO_PASSWORD` | MongoDB password | - | Yes |
| `MONGO_DB` | Database name | `articles` | Yes |
| `PORT` | HTTP server port | `5000` | No |

## How It Works

### Processing Pipeline

1. **Queue Monitoring**: Background worker continuously monitors `articles:queue` in Redis
2. **Article Retrieval**: Pops articles from queue using `BRPOP` (blocking operation)
3. **AI Classification**: Analyzes article title and content using keyword matching
4. **Storage**: Saves classified article to MongoDB `articles` collection
5. **Repeat**: Continuous loop for 24/7 processing

### Classification Logic

Simple keyword-based classification:

- **Technology**: Keywords like "AI", "software", "programming", "cloud", "data"
- **Business**: Keywords like "market", "company", "revenue", "investment", "startup"
- **Science**: Keywords like "research", "study", "scientist", "discovery", "experiment"
- **General**: Default category if no keywords match

### Data Flow

```
Redis (articles:queue) → AI Publisher → MongoDB (articles collection)
```

## Development

### Project Structure

```
ai-publisher/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── Dockerfile          # Production build
├── Dockerfile.dev      # Development build
└── README.md          # This file
```

### Dependencies

- **Flask**: Web framework
- **redis**: Redis client
- **pymongo**: MongoDB client
- **gunicorn**: Production WSGI server

### Building

```bash
# Install dependencies
pip install -r requirements.txt

# For production (minimal dependencies)
pip install Flask redis pymongo gunicorn
```

## Docker Images

### Production Image (Dockerfile)
- Multi-stage build
- Based on `python:3.11-slim`
- Installs dependencies with `--user` flag
- ~100MB final image size
- Runs with Gunicorn (2 workers)

### Development Image (Dockerfile.dev)
- Single-stage build
- Based on `python:3.11-slim`
- Includes all dependencies
- Runs with Flask debug server
- Suitable for development with volume mounts

## Article Structure

Articles stored in MongoDB have the following structure:

```json
{
  "_id": "ObjectId(...)",
  "title": "Article Title",
  "link": "https://example.com/article",
  "pub_date": "2024-01-15T10:30:00Z",
  "content": "Article content snippet...",
  "source": "https://example.com/feed.xml",
  "hash": "md5-hash-of-article",
  "category": "technology",
  "processed_at": "2024-01-15T10:35:00Z"
}
```

## Troubleshooting

### Service won't connect to databases

1. Check Redis and MongoDB are running:
   ```bash
   docker compose ps redis mongodb
   ```

2. Verify connections:
   ```bash
   docker compose logs ai-publisher | grep -i "connected\|error"
   ```

### No articles being processed

1. Check if articles are in the queue:
   ```bash
   docker compose exec redis redis-cli LLEN articles:queue
   ```

2. Verify Smart Harvester is running and harvesting:
   ```bash
   curl http://localhost:3000/stats
   ```

3. Check worker thread is running:
   ```bash
   docker compose logs ai-publisher | grep -i "worker\|processing"
   ```

### MongoDB authentication errors

Verify MongoDB credentials match the environment variables:

```bash
docker compose exec mongodb mongosh -u root -p example --eval "db.version()"
```

### Port already in use

Change the external port in `compose.yml` or `.env`:

```bash
AI_PUBLISHER_EXTERNAL_PORT=5001
```

## Performance

- Background worker processes articles continuously (BRPOP with 1s timeout)
- Single-threaded processing to avoid race conditions
- Gunicorn runs with 2 workers for handling API requests
- Simple keyword matching is fast (< 1ms per article)
- MongoDB indexing on common query fields improves read performance

## Extending the AI

The current implementation uses simple keyword matching. To add real AI:

1. Replace `classify_article()` function
2. Integrate ML models (scikit-learn, TensorFlow, etc.)
3. Add sentiment analysis, topic modeling, or NLP
4. Consider using external APIs (OpenAI, Hugging Face, etc.)

Example with real ML:

```python
from transformers import pipeline

classifier = pipeline("zero-shot-classification")

def classify_article(article):
    text = f"{article['title']} {article['content']}"
    result = classifier(text, candidate_labels=["technology", "business", "science"])
    return result['labels'][0]
```

## License

This is an educational project for learning Docker environment variables and dynamic compose configurations.
