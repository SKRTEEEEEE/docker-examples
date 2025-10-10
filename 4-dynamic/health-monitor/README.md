# Health Monitor - Monitor de Salud de Feeds

Servicio de monitorización de feeds RSS construido con Go. Verifica disponibilidad, mide latencias y clasifica feeds como Green/Yellow/Red.

## Funcionalidad

- Monitoriza disponibilidad de feeds RSS
- Mide latencia y tiempo de respuesta
- Clasifica feeds: **Green** (< 1s), **Yellow** (1-3s), **Red** (> 3s o error)
- API REST para gestión de feeds
- Almacena datos en PostgreSQL
- Chequeos periódicos en background

## Stack Técnico

- **Lenguaje**: Go 1.23
- **Base de Datos**: PostgreSQL 16
- **Puerto**: 8080 (configurable)
- **Build**: Multi-stage optimizado

## Variables de Entorno

```bash
POSTGRES_HOST=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=feeds
PORT=8080
CHECK_INTERVAL=30s  # Intervalo de chequeo
```

## Inicio Rápido

### Con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker compose up -d health-monitor
```

### Local (Desarrollo)

```bash
# 1. Instalar dependencias
go mod download

# 2. Configurar PostgreSQL
createdb feeds

# 3. Ejecutar
go run main.go
```

## API Endpoints

### Health Check

```bash
GET /health
```

Respuesta:
```json
{"status":"ok"}
```

### Añadir Feed

```bash
POST /feeds/add
Content-Type: application/json

{"url": "https://news.ycombinator.com/rss"}
```

### Listar Feeds

```bash
GET /feeds
```

Respuesta:
```json
[
  {
    "url": "https://news.ycombinator.com/rss",
    "status": "green",
    "latency_ms": 250,
    "last_checked": "2025-10-09T14:00:00Z"
  }
]
```

### Obtener Feed Específico

```bash
GET /feeds/{url}
```

### Métricas Agregadas

```bash
GET /metrics
```

Respuesta:
```json
{
  "green": 5,
  "yellow": 2,
  "red": 1,
  "total": 8
}
```

### Eliminar Feed

```bash
DELETE /feeds/{url}
```

## Lógica de Clasificación

- **Green**: Latencia < 1000ms
- **Yellow**: Latencia 1000-3000ms
- **Red**: Latencia > 3000ms o error de conexión

## Estructura de Código

```
health-monitor/
├── main.go           # Punto de entrada, servidor HTTP
├── database.go       # Conexión y queries PostgreSQL
├── checker.go        # Lógica de verificación de feeds
├── go.mod           # Dependencias Go
├── Dockerfile       # Build producción multi-stage
└── README.md        # Esta documentación
```

## Desarrollo

### Build Local

```bash
go build -o health-monitor
./health-monitor
```

### Tests

```bash
go test ./...
```

### Build Docker

```bash
docker build -t health-monitor .
```

## Dockerfile Explicado

```dockerfile
# Etapa builder: compila el binario
FROM golang:1.23-alpine AS builder
# CGO_ENABLED=0 crea binario estático sin dependencias C
RUN CGO_ENABLED=0 go build -o health-monitor .

# Etapa final: imagen mínima
FROM alpine:latest
# ca-certificates para HTTPS
RUN apk add ca-certificates
COPY --from=builder /app/health-monitor .
```

## Solución de Problemas

### No conecta a PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker compose ps postgres

# Ver logs
docker compose logs postgres

# Probar conexión
docker compose exec postgres psql -U postgres -c "SELECT 1"
```

### Feeds no se actualizan

```bash
# Verificar intervalo de chequeo
echo $CHECK_INTERVAL

# Ver logs del servicio
docker compose logs -f health-monitor

# Forzar chequeo manual (próxima feature)
curl -X POST http://localhost:8080/check
```

## Logs

```bash
# Ver logs en tiempo real
docker compose logs -f health-monitor

# Últimas 50 líneas
docker compose logs --tail=50 health-monitor
```

## Dependencias Go

```go
require (
    github.com/gorilla/mux v1.8.1      // Router HTTP
    github.com/lib/pq v1.10.9          // Driver PostgreSQL
)
```

## Próximas Mejoras

- [ ] Endpoint para forzar chequeo inmediato
- [ ] Historial de latencias (integración con InfluxDB)
- [ ] Notificaciones cuando feed pasa a Red
- [ ] Soporte para autenticación en feeds
- [ ] Rate limiting de peticiones

---

**Puerto**: 8080  
**Healthcheck**: `GET /health`  
**Dependencias**: PostgreSQL
