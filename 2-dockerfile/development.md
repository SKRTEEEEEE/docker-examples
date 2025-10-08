# Redes y Comunicación entre Servicios en Docker

## Objetivo

Comprender cómo **interconectar servicios** en Docker usando redes, gestionar el orden de inicio, y configurar entornos de desarrollo con montajes y vigilancia automática de cambios.

---

## 1. Redes en Docker Compose

### ¿Qué son las redes?

Las **redes** permiten que los contenedores se comuniquen entre sí de forma aislada y segura. Por defecto, Docker Compose crea una **red bridge** automática para todos los servicios definidos en el archivo.

### Comunicación entre servicios

Los servicios se comunican usando el **nombre del servicio** como hostname:

```yaml
services:
  backend:
    image: node:22
    networks:
      - app-network
  
  database:
    image: postgres:15
    networks:
      - app-network

networks:
  app-network:
```

✅ El backend puede conectarse a la base de datos usando `postgres://database:5432`

---

### Tipos de redes

| Tipo       | Uso                                                         |
| :--------- | :---------------------------------------------------------- |
| **bridge** | Red por defecto, aislada del host. Para comunicación local |
| **host**   | Usa la red del host directamente (sin aislamiento)          |
| **none**   | Sin red, contenedor aislado completamente                   |

---

### Configuración avanzada de redes

```yaml
services:
  web:
    image: nginx
    networks:
      frontend:
        ipv4_address: 172.20.0.5  # IP estática (opcional)
      backend:

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  backend:
    driver: bridge
```

💡 **Buena práctica**: Separa redes para aislar capas (frontend ↔ backend ↔ database).

---

## 2. Healthchecks: Verificación de Estado

### ¿Qué son?

Los **healthchecks** verifican que un contenedor está **funcionando correctamente**, no solo que el proceso está corriendo. Permiten esperas inteligentes con `depends_on` y mejor gestión en producción.

---

### Configuración básica

```yaml
services:
  database:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s
```

| Parámetro | Descripción | Valor por defecto |
| :-------- | :---------- | :---------------- |
| **test** | Comando de verificación | - |
| **interval** | Tiempo entre comprobaciones | 30s |
| **timeout** | Tiempo máximo de respuesta | 30s |
| **retries** | Fallos antes de marcar unhealthy | 3 |
| **start_period** | Tiempo de gracia inicial | 0s |

**Estados**: `starting` (período inicial) → `healthy` (test pasado) → `unhealthy` (fallos excedidos)

---

### Ejemplos por tipo de servicio

```yaml
# PostgreSQL
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 3s
  retries: 5

# MySQL
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 5s

# MongoDB
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 10s

# Redis
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 5s

# API Node.js
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
  interval: 10s
  start_period: 20s

# Nginx
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost/ || exit 1"]
  interval: 10s
```

💡 **Formato del comando**: `CMD-SHELL` ejecuta en shell, `CMD` ejecuta directamente (más eficiente)

---

### Verificar estado

```bash
# Ver estado actual
docker compose ps

# Inspeccionar detalles
docker inspect --format='{{json .State.Health}}' <container_id>

# Monitorear en tiempo real
docker events --filter event=health_status
```

---

### Mejores prácticas

✅ Incluye siempre `start_period` para servicios lentos  
✅ Tests rápidos y ligeros (no operaciones pesadas)  
✅ Crea endpoints dedicados (`/health`) en tus APIs  
✅ Ajusta `retries` según criticidad: desarrollo 3-5, producción 5-10

❌ Nunca modifiques estado en healthchecks  
❌ Evita para servicios que inician en <1 segundo

---

## 3. Orden de Inicio: `depends_on`

### Sintaxis básica

```yaml
services:
  backend:
    image: node:22
    depends_on:
      - database
  
  database:
    image: postgres:15
```

⚠️ **Importante**: `depends_on` solo garantiza el **orden de inicio**, NO espera a que el servicio esté **listo** (ready).

---

### Espera activa con `condition`

```yaml
services:
  backend:
    depends_on:
      database:
        condition: service_healthy
  
  database:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
```

| Condición             | Significado                           |
| :-------------------- | :------------------------------------ |
| `service_started`     | El contenedor ha iniciado (defecto)   |
| `service_healthy`     | El healthcheck ha pasado              |
| `service_completed_successfully` | El servicio terminó con éxito (exit 0) |

---

## 4. Volúmenes para Desarrollo

### Tipos de volúmenes

| Tipo               | Sintaxis                     | Uso                                   |
| :----------------- | :--------------------------- | :------------------------------------ |
| **Named Volume**   | `db-data:/var/lib/postgresql` | Persistencia gestionada por Docker    |
| **Bind Mount**     | `./src:/app/src`             | Sincronización con código local       |
| **Anonymous Volume** | `/app/node_modules`          | Datos temporales, se borran con `down` |

---

### Ejemplo práctico

```yaml
services:
  frontend:
    build: ./frontend
    volumes:
      - ./frontend/src:/app/src          # Bind mount para hot-reload
      - /app/node_modules                 # Volumen anónimo protegido
    
  database:
    image: postgres:15
    volumes:
      - postgres-data:/var/lib/postgresql/data  # Persistencia

volumes:
  postgres-data:
```

---

### ¿Por qué `/app/node_modules` como volumen anónimo?

```yaml
volumes:
  - ./frontend:/app       # Monta TODO el directorio local
  - /app/node_modules     # Protege node_modules del host
```

**Sin el volumen anónimo**: El `node_modules` del host **sobrescribe** el del contenedor, causando errores si las dependencias difieren entre entornos.

**Con el volumen anónimo**: Docker **prioriza** el volumen del contenedor, evitando conflictos.

---

## 5. Modo Desarrollo: `watch`

### ¿Qué es `watch`?

La directiva **`watch`** (Docker Compose v2.22+) permite **sincronización automática** de cambios sin reiniciar el contenedor completo.

### Acciones disponibles

| Acción       | Efecto                                                      |
| :----------- | :---------------------------------------------------------- |
| **sync**     | Copia archivos al contenedor automáticamente               |
| **rebuild**  | Reconstruye la imagen cuando cambian ciertos archivos      |
| **sync+restart** | Copia archivos y reinicia el servicio                   |

---

### Ejemplo: Hot-reload para desarrollo

```yaml
services:
  backend:
    build: ./backend
    command: npm run dev
    develop:
      watch:
        - action: sync
          path: ./backend/src
          target: /app/src
          ignore:
            - node_modules/
        
        - action: rebuild
          path: ./backend/package.json
```

**Flujo**:
1. Cambias `src/index.ts` → **sync** copia el archivo → nodemon detecta y reinicia
2. Cambias `package.json` → **rebuild** reconstruye la imagen

---

### Ejecutar con watch

```bash
docker compose watch
```

O combinar con `up`:

```bash
docker compose up --watch
```

---

## 6. Ejemplo Completo: Entorno de Desarrollo

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - /app/node_modules
    environment:
      - VITE_API_URL=http://backend:3000
    depends_on:
      - backend
    networks:
      - app-net
    develop:
      watch:
        - action: sync
          path: ./frontend/src
          target: /app/src
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5173 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 20s

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend/src:/app/src
      - /app/node_modules
    environment:
      - DATABASE_URL=postgres://db:5432/appdb
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-net
    develop:
      watch:
        - action: sync
          path: ./backend/src
          target: /app/src
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s

networks:
  app-net:
    driver: bridge

volumes:
  db-data:
```

---

## 7. Comparación: Desarrollo vs Producción

| Aspecto              | Desarrollo                     | Producción                      |
| :------------------- | :----------------------------- | :------------------------------ |
| **Imagen base**      | `node:22` (completa)           | `node:22-alpine` (ligera)       |
| **Volúmenes**        | Bind mounts para hot-reload    | Sin bind mounts                 |
| **Comando**          | `npm run dev`                  | `npm start`                     |
| **Watch**            | Activado                       | Desactivado                     |
| **Dependencias**     | Incluye devDependencies        | Solo dependencies               |
| **Healthchecks**     | Opcionales                     | Obligatorios                    |

---

## Resumen Rápido

✅ **Redes**: Usa nombres de servicio para comunicación, separa capas con múltiples redes  
✅ **Healthchecks**: Verifica que los servicios están operativos, no solo corriendo. Usa `start_period` y endpoints dedicados  
✅ **depends_on**: Controla orden de inicio, usa `condition: service_healthy` para esperas reales  
✅ **Volúmenes**: Bind mounts para desarrollo, named volumes para persistencia, anónimos para proteger directorios  
✅ **Watch**: Sincronización automática de cambios, usa `sync` para archivos y `rebuild` para dependencias