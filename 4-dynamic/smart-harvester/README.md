# Smart Harvester - Cosechador Inteligente de Artículos

Servicio de recolección de artículos RSS construido con Node.js. Cosecha artículos de feeds saludables y los encola para procesamiento.

## Funcionalidad

- Cosecha artículos sólo de feeds Green/Yellow (Health Monitor)
- Parsea feeds RSS/Atom
- Deduplica artículos con Redis
- Encola artículos nuevos para AI Publisher
- API REST para cosecha manual y estadísticas
- Cosecha periódica automática en background

## Stack Técnico

- **Lenguaje**: Node.js 20 LTS
- **Framework**: Express.js
- **Bases de Datos**:
  - PostgreSQL (lee estado de feeds)
  - Redis (caché y cola de mensajes)
- **Puerto**: 3000 (configurable)
- **Build**: Multi-stage optimizado

## Variables de Entorno

```bash
POSTGRES_HOST=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=feeds
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
PORT=3000
HARVEST_INTERVAL=60           # Segundos entre cosechas
ALLOWED_STATUSES=green,yellow # Feeds permitidos
```

## Inicio Rápido

### Con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker compose up -d smart-harvester
```

### Local (Desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables
export POSTGRES_HOST=localhost
export REDIS_HOST=localhost

# 3. Ejecutar
node index.js
```

## API Endpoints

### Health Check

```bash
GET /health
```

Respuesta:
```json
{"status":"ok","service":"smart-harvester"}
```

### Estadísticas

```bash
GET /stats
```

Respuesta:
```json
{
  "queue_length": 15,
  "cached_articles": 120,
  "harvest_interval": 60,
  "allowed_statuses": ["green","yellow"]
}
```

### Cosecha Manual

```bash
POST /harvest
```

Respuesta:
```json
{"status":"harvest started"}
```

Inicia cosecha asíncrona de todos los feeds permitidos.

### Limpiar Caché

```bash
POST /cache/clear
```

Elimina artículos cacheados (útil para testing).

## Flujo de Trabajo

1. **Consulta Health Monitor**: Obtiene feeds con estado Green/Yellow
2. **Descarga Feed**: Realiza petición HTTP al feed RSS
3. **Parsea XML**: Extrae artículos del feed
4. **Deduplica**: Verifica hash en Redis para evitar duplicados
5. **Encola**: Envía artículos nuevos a cola `articles:queue`
6. **Espera**: Duerme `HARVEST_INTERVAL` segundos y repite

## Estructura de Código

```
smart-harvester/
├── index.js         # Servidor Express y lógica principal
├── package.json     # Dependencias npm
├── Dockerfile       # Build producción multi-stage
└── README.md        # Esta documentación
```

## Desarrollo

### Ejecutar Tests

```bash
npm test
```

### Watch Mode (Desarrollo)

```bash
npm run dev  # Con nodemon si está instalado
```

### Build Docker

```bash
docker build -t smart-harvester .
```

## Dockerfile Explicado

```dockerfile
# Etapa builder: instala dependencias
FROM node:20-alpine AS builder
# --omit=dev excluye devDependencies
RUN npm install --omit=dev

# Etapa final: copia node_modules optimizado
FROM node:20-alpine
COPY --from=builder /app .
# USER node: ejecuta como no-root (seguridad)
USER node
```

## Dependencias npm

```json
{
  "express": "^4.18.2",      // Servidor HTTP
  "pg": "^8.11.3",           // Cliente PostgreSQL
  "redis": "^4.6.10",        // Cliente Redis
  "xml2js": "^0.6.2",        // Parser XML
  "node-fetch": "^3.3.2"     // Cliente HTTP
}
```

## Solución de Problemas

### No encuentra feeds

```bash
# Verificar que Health Monitor tiene feeds
curl http://localhost:8080/feeds

# Si está vacío, añadir feeds
curl -X POST http://localhost:8080/feeds/add \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com/rss"}'
```

### Cola no crece

```bash
# Verificar estadísticas
curl http://localhost:3000/stats

# Ver logs
docker compose logs -f smart-harvester

# Probar cosecha manual
curl -X POST http://localhost:3000/harvest
```

### Errores de conexión Redis

```bash
# Verificar Redis
docker compose ps redis
docker compose logs redis

# Probar conexión
docker compose exec redis redis-cli ping
```

## Formato de Artículo Encolado

```json
{
  "title": "Ejemplo de Artículo",
  "link": "https://example.com/article",
  "content": "Contenido completo del artículo...",
  "source": "https://example.com/feed.xml",
  "pubDate": "Mon, 09 Oct 2025 14:00:00 GMT",
  "hash": "a1b2c3d4..."
}
```

El hash se usa para deduplicación en Redis.

## Logs

```bash
# Ver logs en tiempo real
docker compose logs -f smart-harvester

# Últimas 100 líneas
docker compose logs --tail=100 smart-harvester
```

## Testing Manual

```bash
# 1. Añadir feed de prueba
curl -X POST http://localhost:8080/feeds/add \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com/rss"}'

# 2. Esperar 30s (health check)

# 3. Verificar que está Green
curl http://localhost:8080/feeds

# 4. Forzar cosecha
curl -X POST http://localhost:3000/harvest

# 5. Verificar cola
curl http://localhost:3000/stats
```

## Próximas Mejoras

- [ ] Soporte para feeds Atom
- [ ] Rate limiting por dominio
- [ ] Reintento con backoff exponencial
- [ ] Métricas de artículos procesados
- [ ] Filtrado de artículos por fecha

---

**Puerto**: 3000  
**Healthcheck**: `GET /health`  
**Dependencias**: PostgreSQL, Redis  
**Cola Redis**: `articles:queue`
