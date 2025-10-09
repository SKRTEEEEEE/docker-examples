# AI Publisher - Clasificador y Publicador con IA

Servicio de clasificación de artículos construido con Python/Flask. Procesa artículos de Redis, los clasifica con IA y almacena en MongoDB.

## Funcionalidad

- Consume artículos de cola Redis
- Clasifica artículos en categorías automáticamente
- Genera resúmenes de contenido
- Soporte para clasificación con OpenAI/Anthropic
- Gestiona reglas de publicación
- API REST para consultar artículos
- Worker en background para procesamiento continuo

## Stack Técnico

- **Lenguaje**: Python 3.11
- **Framework**: Flask
- **Bases de Datos**:
  - Redis (cola de artículos)
  - MongoDB (artículos clasificados)
- **Puerto**: 5000 (configurable)
- **Build**: Multi-stage optimizado

## Variables de Entorno

```bash
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_USER=root
MONGO_PASSWORD=example
MONGO_DB=articles
PORT=5000
# Clasificación IA
AI_MODEL=keyword              # keyword | openai | anthropic
OPENAI_API_KEY=               # Opcional
ANTHROPIC_API_KEY=            # Opcional
```

## Inicio Rápido

### Con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
docker compose up -d ai-publisher
```

### Local (Desarrollo)

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar
python app.py
```

## API Endpoints

### Health Check

```bash
GET /health
```

Respuesta:
```json
{"status":"ok","service":"ai-publisher"}
```

### Listar Artículos

```bash
GET /articles?limit=10
GET /articles?category=Technology
GET /articles?category=Finance&limit=5
```

Respuesta:
```json
[
  {
    "_id": "...",
    "title": "Artículo de ejemplo",
    "link": "https://...",
    "category": "Technology",
    "summary": "Resumen generado...",
    "should_publish": true,
    "processed_at": "2025-10-09T14:00:00"
  }
]
```

### Obtener Artículo

```bash
GET /articles/{hash}
```

### Estadísticas

```bash
GET /stats
```

Respuesta:
```json
{
  "total_articles": 150,
  "by_category": {
    "Technology": 45,
    "Finance": 20,
    "Health": 15,
    "General": 70
  },
  "publishable": 120,
  "queue_length": 5
}
```

### Reglas de Publicación

```bash
# Listar reglas
GET /rules

# Crear regla
POST /rules
Content-Type: application/json

{
  "category": "Finance",
  "min_summary_length": 100
}
```

## Categorías de Clasificación

1. **Technology**: tech, software, ai, computer, digital, app, code, data, internet, algorithm
2. **Finance**: money, bank, stock, market, invest, economy, finance, trading, crypto, currency
3. **Health**: health, medical, doctor, disease, hospital, medicine, patient, treatment, wellness
4. **Politics**: government, election, president, vote, congress, senate, law, policy, minister
5. **Entertainment**: movie, music, celebrity, film, concert, show, actor, artist, game
6. **General**: Artículos sin categoría clara

## Modos de Clasificación

### Keyword (Por Defecto)

Clasificación basada en palabras clave. No requiere API keys.

```bash
AI_MODEL=keyword
```

Rápido y gratuito, precisión ~70%.

### OpenAI

Usa GPT-3.5-turbo para clasificación mejorada.

```bash
AI_MODEL=openai
OPENAI_API_KEY=sk-...
```

Mayor precisión ~90%, requiere API key y costo por uso.

### Anthropic

Usa Claude para clasificación.

```bash
AI_MODEL=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

Alta precisión, requiere API key y costo por uso.

## Estructura de Código

```
ai-publisher/
├── app.py              # Servidor Flask y worker
├── requirements.txt    # Dependencias Python
├── Dockerfile          # Build producción multi-stage
└── README.md          # Esta documentación
```

## Desarrollo

### Tests

```bash
pytest
```

### Ejecutar con Debug

```bash
export FLASK_ENV=development
python app.py
```

### Build Docker

```bash
docker build -t ai-publisher .
```

## Dockerfile Explicado

```dockerfile
# Etapa builder: instala dependencias
FROM python:3.11-slim AS builder
# --user instala en ~/.local (multi-stage limpio)
# --no-cache-dir reduce tamaño de imagen
RUN pip install --no-cache-dir --user -r requirements.txt

# Etapa final: copia paquetes Python
FROM python:3.11-slim
COPY --from=builder /root/.local /root/.local
# Añade .local/bin al PATH
ENV PATH=/root/.local/bin:$PATH
```

## Dependencias Python

```txt
flask==3.0.0
redis==5.0.1
pymongo==4.6.0
openai==1.3.0          # Opcional, para AI
anthropic==0.8.0       # Opcional, para AI
```

## Solución de Problemas

### No procesa artículos

```bash
# Verificar cola Redis
curl http://localhost:3000/stats  # Debe tener queue_length > 0

# Ver logs del worker
docker compose logs -f ai-publisher

# Comprobar MongoDB
docker compose exec mongodb mongosh --eval "db.articles.countDocuments({})"
```

### Error de clasificación IA

```bash
# Verificar API key
echo $OPENAI_API_KEY

# Cambiar a keyword temporalmente
AI_MODEL=keyword docker compose up -d ai-publisher
```

### MongoDB no conecta

```bash
# Verificar MongoDB
docker compose ps mongodb
docker compose logs mongodb

# Probar conexión
docker compose exec mongodb mongosh -u root -p example
```

## Formato de Artículo Procesado

```json
{
  "title": "Ejemplo",
  "link": "https://...",
  "source": "https://feed.xml",
  "pub_date": "2025-10-09T14:00:00Z",
  "content": "Contenido completo...",
  "category": "Technology",
  "summary": "Resumen generado de 150 caracteres máximo...",
  "hash": "a1b2c3...",
  "should_publish": true,
  "publish_decision_reason": "Passed all rules",
  "processed_at": "2025-10-09T14:05:00Z"
}
```

## Logs

```bash
# Ver logs en tiempo real
docker compose logs -f ai-publisher

# Filtrar por nivel
docker compose logs ai-publisher | grep ERROR
```

## Testing Manual

```bash
# 1. Verificar que hay artículos en cola
curl http://localhost:3000/stats

# 2. Si no hay, forzar cosecha
curl -X POST http://localhost:3000/harvest

# 3. Esperar 5-10s para procesamiento

# 4. Ver artículos clasificados
curl http://localhost:5000/articles

# 5. Ver estadísticas
curl http://localhost:5000/stats
```

## Próximas Mejoras

- [ ] Soporte para más modelos IA (Gemini, Cohere)
- [ ] Generación de resúmenes con IA
- [ ] Detección de sentimiento
- [ ] Extracción de entidades (NER)
- [ ] Sistema de puntuación de calidad
- [ ] Publicación automática a redes sociales

---

**Puerto**: 5000  
**Healthcheck**: `GET /health`  
**Dependencias**: Redis, MongoDB  
**Cola Redis**: `articles:queue` (consumidor)
