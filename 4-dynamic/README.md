# Agregador RSS Inteligente con Clasificación IA

Sistema de procesamiento de feeds RSS con 3 microservicios y 4 bases de datos distintas para gestionar salud de feeds, almacenamiento y clasificación inteligente de contenido.

## 🎯 Flujo del Sistema

1. **Health Monitor** (Go) → Monitoriza latencia y salud de feeds RSS
2. **Smart Harvester** (Node.js) → Cosecha artículos sólo de feeds "Green"
3. **AI Publisher** (Python) → Clasifica y enriquece contenido con IA

## 🛠️ Arquitectura

```
├── health-monitor/     # Go - Monitorización de feeds
├── smart-harvester/    # Node.js - Recolección de artículos
├── ai-publisher/       # Python - Clasificación IA
├── compose.yml         # Configuración Docker Compose con watch
├── .env               # Entorno desarrollo (por defecto)
├── .env.dev           # Configuración desarrollo
└── .env.prod          # Configuración producción
```

### Bases de Datos

- **PostgreSQL**: Estado de salud de feeds (Green/Yellow/Red)
- **Redis**: Cola de mensajes y control de duplicados
- **MongoDB**: Artículos clasificados y enriquecidos
- **InfluxDB**: Métricas históricas de latencia

## 🚀 Inicio Rápido

### Desarrollo (con watch automático)

```bash
# Inicia con recarga automática al modificar código
docker compose watch

# O modo tradicional
docker compose up --build
```

El modo watch recarga automáticamente:
- **health-monitor**: Reconstruye imagen al cambiar código Go
- **smart-harvester**: Sincroniza cambios y reinicia servicio
- **ai-publisher**: Sincroniza cambios Python y reinicia

### Producción

```bash
docker compose --env-file .env.prod up -d --build
```

## 🧪 Verificar Sistema

### 1. Comprobar Servicios

```bash
docker ps
curl http://localhost:8080/health  # Health Monitor
curl http://localhost:3000/health  # Smart Harvester
curl http://localhost:5000/health  # AI Publisher
```

### 2. Añadir Feeds RSS

```bash
curl -X POST http://localhost:8080/feeds/add \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com/rss"}'

curl http://localhost:8080/feeds  # Ver estado de feeds
```

### 3. Cosechar Artículos

```bash
curl -X POST http://localhost:3000/harvest
curl http://localhost:3000/stats  # Ver estadísticas
```

### 4. Ver Artículos Clasificados

```bash
curl http://localhost:5000/articles
curl http://localhost:5000/articles?category=Technology
curl http://localhost:5000/stats  # Estadísticas por categoría
```

## ⚙️ Configuración

### Variables Esenciales

**Modo de Operación:**
- `RESTART_POLICY`: `no` (dev) / `unless-stopped` (prod)

**Clasificación IA:**
- `AI_MODEL`: `keyword` (por defecto) / `openai` / `anthropic`
- `OPENAI_API_KEY`: Clave API de OpenAI (opcional)
- `ANTHROPIC_API_KEY`: Clave API de Anthropic (opcional)

**Intervalos:**
- `CHECK_INTERVAL`: Frecuencia chequeo feeds (ej: `30s`, `1m`)
- `HARVEST_INTERVAL`: Intervalo cosecha en segundos (ej: `60`)

### Bases de Datos

Configuración en `.env`:

```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=feeds

# Redis (password opcional en dev)
REDIS_PASSWORD=

# MongoDB
MONGO_USER=root
MONGO_PASSWORD=example
MONGO_DB=articles
```

## 🔬 Clasificación con IA

### Modo Keyword (Por Defecto)

Clasificación basada en palabras clave. No requiere API keys.

```bash
AI_MODEL=keyword
```

Categorías: Technology, Finance, Health, Politics, Entertainment, General

### Modo OpenAI

Requiere clave API de OpenAI:

```bash
AI_MODEL=openai
OPENAI_API_KEY=sk-...
```

Usa GPT-3.5-turbo para clasificación más precisa.

### Modo Anthropic

Requiere clave API de Anthropic:

```bash
AI_MODEL=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

## 🔧 Desarrollo

### Estructura de Dockerfiles

Cada servicio tiene:
- `Dockerfile`: Build multi-etapa optimizado (producción)
- `Dockerfile.dev`: Build rápido para desarrollo (opcional)

Comentarios en español explican líneas especiales.

### Watch Mode

El compose.yml incluye configuración `develop.watch`:

- **Go (health-monitor)**: Reconstruye completamente
- **Node.js (smart-harvester)**: Sincroniza y reinicia
- **Python (ai-publisher)**: Sincroniza y reinicia

```bash
# Activa watch mode
docker compose watch
```

### Inspeccionar Configuración

```bash
# Ver configuración final con variables resueltas
docker compose config

# Ver con entorno específico
docker compose --env-file .env.prod config
```

## 📊 Monitorización

### Logs en Tiempo Real

```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f ai-publisher

# Últimas 50 líneas
docker compose logs --tail=50 smart-harvester
```

### Estado de Contenedores

```bash
docker compose ps
docker compose top
```

## 🛑 Detener Sistema

```bash
# Detener sin borrar volúmenes
docker compose down

# Detener y borrar volúmenes (limpieza completa)
docker compose down -v

# Modo producción
docker compose --env-file .env.prod down
```

## 📋 Workflow Completo

1. **Iniciar servicios**
   ```bash
   docker compose up -d
   ```

2. **Añadir feeds**
   ```bash
   curl -X POST http://localhost:8080/feeds/add \
     -H "Content-Type: application/json" \
     -d '{"url":"https://techcrunch.com/feed/"}'
   ```

3. **Esperar 30s** (health monitor chequea feeds)

4. **Verificar estado**
   ```bash
   curl http://localhost:8080/feeds
   ```

5. **Cosechar artículos**
   ```bash
   curl -X POST http://localhost:3000/harvest
   ```

6. **Esperar 5-10s** (procesamiento IA)

7. **Ver resultados**
   ```bash
   curl http://localhost:5000/articles
   curl http://localhost:5000/stats
   ```

## 🐛 Solución de Problemas

### Servicios no arrancan

```bash
# Ver logs de error
docker compose logs

# Reconstruir desde cero
docker compose down -v
docker compose up --build
```

### Base de datos no conecta

```bash
# Verificar health checks
docker compose ps

# Ver logs de BD específica
docker compose logs postgres
docker compose logs mongodb
```

### Puerto en uso

```bash
# Modificar puertos externos en .env
HEALTH_MONITOR_EXTERNAL_PORT=8081
SMART_HARVESTER_EXTERNAL_PORT=3001
AI_PUBLISHER_EXTERNAL_PORT=5001
```

## 📚 Documentación Adicional

- **Archivos `.http`**: Ver `api-test.md` para testing con REST Client
- **READMEs servicios**: Cada carpeta tiene README específico
- **Diagramas**: Ver `dynamic.md` para arquitectura detallada

## ✅ Checklist de Verificación

- [ ] Servicios corriendo: `docker compose ps`
- [ ] Health checks OK: `curl http://localhost:8080/health`
- [ ] Feeds añadidos: `curl http://localhost:8080/feeds`
- [ ] Feeds con estado Green: Verificar respuesta anterior
- [ ] Cosecha ejecutada: `curl -X POST http://localhost:3000/harvest`
- [ ] Artículos procesados: `curl http://localhost:5000/articles`
- [ ] Clasificación funciona: Verificar campo `category` en artículos

## 🎯 Próximos Pasos

1. Añade tu propia clave de OpenAI en `.env` para clasificación mejorada
2. Crea reglas de publicación en MongoDB
3. Personaliza categorías en `ai-publisher/app.py`
4. Añade más feeds RSS de diferentes temáticas
5. Implementa alertas cuando feeds fallen

---

**Versión**: 1.0  
**Stack**: Go 1.23 + Node.js 20 + Python 3.11  
**Docker Compose**: v2.x con watch support
