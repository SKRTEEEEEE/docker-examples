# API Testing Guide

This guide explains how to use the `.http` files included with each microservice to test the RSS aggregator pipeline.

## What are .http files?

`.http` (or `.rest`) files are plain text files containing HTTP requests that can be executed directly from your code editor. They provide a simple, version-controlled way to test REST APIs without leaving your development environment.

## Supported Tools

### Visual Studio Code
1. Install the **REST Client** extension by Huachao Mao
2. Open any `.http` file
3. Click "Send Request" above each request or use `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)

### JetBrains IDEs (IntelliJ, WebStorm, PyCharm, etc.)
Built-in support for `.http` files:
1. Open any `.http` file
2. Click the ▶️ icon in the gutter next to each request
3. Or use `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

### Other Tools
- **Postman**: Import the requests manually
- **curl**: Copy the request details and use curl commands
- **httpie**: Use the HTTPie CLI with the request details

## File Locations

Each microservice has its own `api-test.http` file:

```
4-dynamic/
├── health-monitor/
│   └── api-test.http       # Health Monitor API tests
├── smart-harvester/
│   └── api-test.http       # Smart Harvester API tests
├── ai-publisher/
│   └── api-test.http       # AI Publisher API tests
└── api-test.md            # This guide
```

## Testing Order

To test the complete RSS aggregator pipeline, follow this sequence:

### Phase 1: Setup and Add Feeds

**File**: `health-monitor/api-test.http`

1. **Test Health Check** (Request #1)
   ```
   GET http://localhost:8080/health
   ```
   Expected: `{"status":"ok","service":"health-monitor"}`

2. **Add RSS Feeds** (Requests #2, #3, #4)
   ```
   POST http://localhost:8080/feeds/add
   {"url": "https://news.ycombinator.com/rss"}
   ```
   Expected: Success message for each feed

3. **Wait 30-60 seconds** for the health checker to run its first cycle

4. **Check Feed Status** (Request #5)
   ```
   GET http://localhost:8080/feeds
   ```
   Expected: Array of feeds with status "green", "yellow", or "red"

5. **View Metrics** (Request #6)
   ```
   GET http://localhost:8080/metrics
   ```
   Expected: Metrics grouped by status (green/yellow/red)

### Phase 2: Harvest Articles

**File**: `smart-harvester/api-test.http`

1. **Check Harvester Health** (Request #1)
   ```
   GET http://localhost:3000/health
   ```
   Expected: `{"status":"ok","service":"smart-harvester"}`

2. **Check Initial Stats** (Request #2)
   ```
   GET http://localhost:3000/stats
   ```
   Expected: Statistics showing queue length, cached articles, etc.

3. **Trigger Manual Harvest** (Request #3)
   ```
   POST http://localhost:3000/harvest
   ```
   Expected: `{"status":"harvest started"}`
   Note: This is asynchronous!

4. **Wait 5-10 seconds** for harvesting to complete

5. **Check Stats Again** (Request #4)
   ```
   GET http://localhost:3000/stats
   ```
   Expected: `queue_length` should have increased

### Phase 3: View Classified Articles

**File**: `ai-publisher/api-test.http`

1. **Check Publisher Health** (Request #1)
   ```
   GET http://localhost:5000/health
   ```
   Expected: `{"service":"ai-publisher","status":"ok"}`

2. **Wait 5-10 seconds** for the background worker to process articles

3. **View All Articles** (Request #2)
   ```
   GET http://localhost:5000/articles
   ```
   Expected: Array of classified articles with categories

4. **Filter by Category** (Requests #3-6)
   ```
   GET http://localhost:5000/articles?category=technology
   ```
   Expected: Only articles in the specified category

5. **Check Statistics** (Request #8)
   ```
   GET http://localhost:5000/stats
   ```
   Expected: Total articles and breakdown by category

6. **View Classification Rules** (Request #9)
   ```
   GET http://localhost:5000/rules
   ```
   Expected: Keywords used for each category

## Common HTTP Request Syntax

### Variables
Define reusable variables at the top of the file:
```http
@baseUrl = http://localhost:8080
@contentType = application/json
```

Use variables in requests:
```http
GET {{baseUrl}}/health HTTP/1.1
```

### Request Separator
Separate multiple requests with `###`:
```http
### Request 1
GET http://localhost:8080/health

### Request 2
GET http://localhost:8080/feeds
```

### Headers
Add headers after the request line:
```http
POST http://localhost:8080/feeds/add HTTP/1.1
Content-Type: application/json
Authorization: Bearer token123
```

### Request Body
Add the body after headers (with blank line):
```http
POST http://localhost:8080/feeds/add HTTP/1.1
Content-Type: application/json

{
  "url": "https://example.com/feed.xml"
}
```

### Comments
Use `#` or `//` for comments:
```http
# This is a comment
// This is also a comment
```

## Quick Testing Checklist

Use this checklist to verify the entire pipeline works:

- [ ] Health Monitor is running (`GET /health`)
- [ ] Feeds can be added (`POST /feeds/add`)
- [ ] Feeds show green/yellow status (`GET /feeds`)
- [ ] Metrics are calculated (`GET /metrics`)
- [ ] Smart Harvester is running (`GET /health`)
- [ ] Harvest can be triggered (`POST /harvest`)
- [ ] Queue length increases after harvest (`GET /stats`)
- [ ] AI Publisher is running (`GET /health`)
- [ ] Articles appear in database (`GET /articles`)
- [ ] Articles are categorized correctly (`GET /articles?category=technology`)
- [ ] Statistics show article counts (`GET /stats`)

## Troubleshooting

### Connection Refused
- **Problem**: Can't connect to `localhost:PORT`
- **Solution**: 
  1. Check services are running: `docker compose ps`
  2. Verify port mappings in `compose.yml`
  3. Make sure you're using the correct port for each service

### Empty Response
- **Problem**: API returns empty array or no data
- **Solutions**:
  1. Wait longer between steps (especially after triggering harvest)
  2. Check logs: `docker compose logs [service-name]`
  3. Verify previous steps completed successfully

### 404 Not Found
- **Problem**: Endpoint doesn't exist
- **Solutions**:
  1. Check the URL path is correct
  2. Verify the service is running
  3. Review the service's README for correct endpoints

### 500 Internal Server Error
- **Problem**: Server-side error
- **Solutions**:
  1. Check service logs: `docker compose logs [service-name]`
  2. Verify database connections
  3. Check environment variables are set correctly

## Advanced: Custom Workflows

### Test with Different Feed Sources

Try adding different RSS feeds:

```http
POST http://localhost:8080/feeds/add
Content-Type: application/json

{"url": "https://www.reddit.com/r/programming/.rss"}
```

```http
POST http://localhost:8080/feeds/add
Content-Type: application/json

{"url": "https://techcrunch.com/feed/"}
```

### Monitor in Real-Time

Create a loop to monitor the pipeline:

1. Check harvester stats every 10 seconds:
   ```http
   GET http://localhost:3000/stats
   ```

2. Check article count:
   ```http
   GET http://localhost:5000/stats
   ```

3. View latest articles:
   ```http
   GET http://localhost:5000/articles?limit=5
   ```

### Test Error Handling

Try invalid requests to see error handling:

```http
# Invalid URL format
POST http://localhost:8080/feeds/add
Content-Type: application/json

{"url": "not-a-valid-url"}
```

```http
# Duplicate feed
POST http://localhost:8080/feeds/add
Content-Type: application/json

{"url": "https://news.ycombinator.com/rss"}
```

## Environment-Specific Testing

### Production Environment

Update the base URL to test against production:

```http
@baseUrl = https://your-production-domain.com
```

### Different Ports

If you changed the default ports in `.env`:

```http
@healthMonitorUrl = http://localhost:8081
@smartHarvesterUrl = http://localhost:3001
@aiPublisherUrl = http://localhost:5001
```

## Tips and Best Practices

1. **Use Variables**: Define base URLs as variables for easy environment switching
2. **Add Comments**: Document what each request does and expected responses
3. **Sequential Testing**: Test in the order listed above for best results
4. **Wait Between Requests**: Give asynchronous operations time to complete
5. **Check Logs**: If something fails, check service logs for details
6. **Save Responses**: Most HTTP clients can save responses for comparison
7. **Version Control**: Commit `.http` files along with your code

## Alternative Testing Methods

### Using curl

Convert HTTP requests to curl commands:

```bash
# Health check
curl http://localhost:8080/health

# Add feed
curl -X POST http://localhost:8080/feeds/add \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com/rss"}'

# Get feeds
curl http://localhost:8080/feeds
```

### Using PowerShell (Windows)

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:8080/health"

# Add feed
Invoke-WebRequest -Uri "http://localhost:8080/feeds/add" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"url":"https://news.ycombinator.com/rss"}'

# Get feeds
Invoke-WebRequest -Uri "http://localhost:8080/feeds" | Select-Object -ExpandProperty Content
```

## Learning Resources

- [REST Client VSCode Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [JetBrains HTTP Client](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html)
- [HTTP Request Syntax](https://github.com/rest-client/rest-client)

## Need Help?

1. Check service logs: `docker compose logs [service-name]`
2. Verify services are running: `docker compose ps`
3. Review individual service READMEs in each folder
4. Check the main project README in the root directory
