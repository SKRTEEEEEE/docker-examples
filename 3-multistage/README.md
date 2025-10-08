# Optimización de Imágenes Docker con Multistage Builds

## Objetivo

Dominar las técnicas avanzadas de optimización de imágenes Docker mediante **Multistage Builds**, **Layer Caching** y estrategias de construcción eficiente. Aprenderás a crear imágenes ligeras, rápidas de construir y seguras, separando las herramientas de compilación del entorno de ejecución.

---

## Conceptos Fundamentales

### Layers (Capas)

**¿Qué son las capas?**
- Cada instrucción en un Dockerfile (`FROM`, `RUN`, `COPY`, `ADD`, etc.) crea una **capa (layer)** en la imagen.
- Las capas son **read-only** (solo lectura) y se apilan una sobre otra.
- Docker utiliza un sistema de archivos **Union FS** que combina estas capas en una sola vista.

**Ventajas:**
- **Reutilización**: Las capas compartidas entre imágenes se almacenan una sola vez.
- **Velocidad**: Si una capa ya existe, Docker la reutiliza sin reconstruirla.

**Buenas prácticas:**
- Minimiza el número de capas combinando comandos relacionados
- Ordena las instrucciones de menos a más cambiantes (dependencias primero, código después)

---

### Caching (Caché)

**¿Cómo funciona el caché de Docker?**
- Docker cachea cada capa basándose en el contenido de la instrucción.
- Si una instrucción no ha cambiado, Docker reutiliza la capa cacheada.
- **Invalidación**: Si una capa cambia, todas las capas posteriores se invalidan y deben reconstruirse.

**Estrategia para optimizar caché:**

```dockerfile
# ❌ Mal - invalida caché en cada cambio de código
COPY . .
RUN npm install

# ✅ Bien - las dependencias se cachean separadamente
COPY package*.json ./
RUN npm install
COPY src ./src
```

**Orden óptimo:**
1. Copiar archivos de manifiesto de dependencias (`package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`)
2. Instalar dependencias (esta capa rara vez cambia)
3. Copiar código fuente (cambia frecuentemente)
4. Compilar/construir aplicación

---

### Multistage Builds (Construcciones Multietapa)

**¿Qué es Multistage?**
- Permite usar **múltiples instrucciones `FROM`** en un mismo Dockerfile.
- Cada `FROM` inicia una nueva **etapa (stage)** que puede tener un nombre mediante `AS nombre`.
- Las etapas son independientes pero pueden **compartir artefactos** mediante `COPY --from=stage`.

**Beneficios:**
1. **Imágenes más pequeñas**: La imagen final solo contiene lo necesario para ejecutar (sin compiladores ni dependencias de build).
2. **Seguridad**: Menos superficie de ataque al eliminar herramientas de desarrollo.
3. **Claridad**: Separa responsabilidades (build vs runtime).
4. **Flexibilidad**: Permite diferentes imágenes base para cada etapa.

**Arquitectura típica:**
```
┌─────────────────────────┐
│  STAGE 1: Builder       │  ← Imagen con herramientas de compilación
│  - Compilar código      │
│  - Generar artefactos   │
└─────────────────────────┘
            ↓ COPY --from=builder
┌─────────────────────────┐
│  STAGE 2: Runtime       │  ← Imagen ligera solo con runtime
│  - Solo binario/código  │
│  - Dependencias mínimas │
└─────────────────────────┘
```

**Reducción típica de tamaño:** 70-95% dependiendo del lenguaje y dependencias.

---

## Instrucciones Dockerfile Clave

### `FROM ... AS stage` - Definir Etapas

Inicia una nueva etapa en el build con un nombre identificable.

```dockerfile
FROM node:20-alpine AS builder
# Esta etapa se puede referenciar después

FROM node:20-alpine AS runtime
COPY --from=builder /app/dist /app/
```

---

### `COPY` vs `ADD`

**`COPY`**: Copia archivos/directorios del host al contenedor.
```dockerfile
COPY src ./src
COPY package.json package-lock.json ./
```

**`ADD`**: Similar a `COPY` pero con funcionalidades extras:
- Extrae automáticamente archivos `.tar`
- Puede descargar archivos desde URLs

**Recomendación:** Usa `COPY` en la mayoría de casos por su simplicidad y previsibilidad. Solo usa `ADD` cuando necesites sus características específicas.

---

### `COPY --from=stage` - Copiar Entre Etapas

Copia artefactos desde una etapa anterior a la etapa actual.

```dockerfile
FROM golang:1.21 AS builder
WORKDIR /app
RUN go build -o myapp

FROM alpine:3.19 AS runtime
COPY --from=builder /app/myapp /usr/local/bin/
```

También puedes copiar desde imágenes externas:

```dockerfile
COPY --from=nginx:alpine /etc/nginx/nginx.conf /etc/nginx/
```

---

### `ENTRYPOINT` vs `CMD`

**`ENTRYPOINT`**: Define el ejecutable principal (no se sobrescribe fácilmente).
```dockerfile
ENTRYPOINT ["python", "app.py"]
```

**`CMD`**: Argumentos por defecto para `ENTRYPOINT` o comando completo.
```dockerfile
CMD ["--port", "8080"]
```

**Combinados:**
```dockerfile
ENTRYPOINT ["./myapp"]
CMD ["--config", "/etc/config.yaml"]
# Ejecuta: ./myapp --config /etc/config.yaml
# Override: docker run myimage --config /custom/config.yaml
```

**Cuándo usar cada uno:**
- **Solo `ENTRYPOINT`**: Cuando el contenedor debe ejecutar siempre un comando específico
- **Solo `CMD`**: Cuando quieres flexibilidad para cambiar todo el comando
- **Ambos**: Cuando quieres un ejecutable fijo con argumentos configurables

---

### `RUN` - Ejecutar Comandos en Build Time

Ejecuta comandos durante la construcción de la imagen.

**Sintaxis:**
```dockerfile
RUN comando arg1 arg2
# o forma exec (preferida para evitar problemas con shell)
RUN ["ejecutable", "arg1", "arg2"]
```

**Optimización: Combinar comandos para reducir capas:**
```dockerfile
# ❌ Mal - crea 3 capas
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# ✅ Bien - crea 1 capa y limpia en el mismo paso
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

---

## Patrones de Multistage por Lenguaje

### Lenguajes Compilados (Go, Rust, C++)

**Patrón:**
1. **Builder**: Imagen completa con compilador y dependencias de desarrollo
2. **Runtime**: Imagen mínima (alpine, distroless, scratch) con solo el binario

```dockerfile
# Stage 1: Compilación
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o app

# Stage 2: Ejecución
FROM alpine:3.19
COPY --from=builder /app/app /app
ENTRYPOINT ["/app"]
```

**Reducción esperada:** 90-95% (de ~800MB a ~20-50MB)

---

### Lenguajes Interpretados con Build (Node.js, Python con compilación)

**Patrón:**
1. **Builder**: Instala dependencias, compila assets
2. **Runtime**: Solo dependencias de producción y código compilado

```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

**Reducción esperada:** 60-80% (elimina devDependencies y archivos fuente)

---

### Aplicaciones con Assets Estáticos (Frontend + Backend)

**Patrón:**
1. **Builder**: Compila frontend
2. **Runtime**: Servidor web ligero (nginx) con solo los archivos estáticos

```dockerfile
# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

**Reducción esperada:** 85-90% (de ~500MB a ~30-50MB)

---

## Estrategias Avanzadas de Optimización

### Dummy Build para Cachear Dependencias

**Problema**: Cambiar código fuente invalida el caché de instalación de dependencias.

**Solución**: Crear un proyecto dummy para compilar solo las dependencias.

```dockerfile
FROM rust:1.83-alpine AS builder
WORKDIR /app

# Copiar solo manifiestos de dependencias
COPY Cargo.toml Cargo.lock ./

# Crear proyecto dummy
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Ahora copiar código real (las deps ya están cacheadas)
COPY src ./src
RUN touch src/main.rs && cargo build --release
```

Este patrón funciona para cualquier lenguaje: crea un archivo de entrada mínimo, instala dependencias, luego reemplaza con código real.

---

### Limpieza Agresiva en Cada Capa

**Principio**: Eliminar archivos temporales en el mismo `RUN` que los crea.

```dockerfile
RUN apk add --no-cache --virtual .build-deps \
    gcc musl-dev && \
    pip install --no-cache-dir -r requirements.txt && \
    apk del .build-deps
```

**Elementos a limpiar:**
- Cachés de package managers (`apt`, `apk`, `npm`, `pip`)
- Dependencias de compilación ya no necesarias
- Archivos temporales y logs

---

### Multi-target Builds

Puedes crear múltiples imágenes finales desde un solo Dockerfile usando `--target`.

```dockerfile
FROM node:20 AS base
WORKDIR /app
COPY package*.json ./

FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS production
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

**Uso:**
```bash
# Build para desarrollo
docker build --target development -t myapp:dev .

# Build para producción
docker build --target production -t myapp:prod .
```

---

## Consideraciones de Seguridad

### Usuario No-Root

**Nunca ejecutes aplicaciones como root en producción.**

```dockerfile
FROM alpine:3.19
RUN addgroup -g 1000 appgroup && \
    adduser -D -u 1000 -G appgroup appuser
WORKDIR /app
COPY --chown=appuser:appgroup app /app/
USER appuser
CMD ["./app"]
```

---

### Imágenes Base Minimalistas

**Orden de minimalismo (de más a menos código):**

1. **scratch**: Completamente vacía (solo para binarios estáticos)
2. **distroless**: Sin shell, sin package manager (Google)
3. **alpine**: Distribución mínima (~5MB)
4. **slim**: Versión reducida de debian/ubuntu

**Ejemplo con distroless:**
```dockerfile
FROM golang:1.21 AS builder
RUN go build -o app

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/app /
CMD ["/app"]
```

---

## Resumen de Mejores Prácticas

✅ **Ordena instrucciones**: Menos cambiante primero (dependencias), más cambiante después (código)  
✅ **Multistage siempre para lenguajes compilados**: Reduce tamaño y superficie de ataque  
✅ **Cachea dependencias**: Copia manifiestos antes del código fuente  
✅ **Usa `.dockerignore`**: Excluye archivos innecesarios del contexto de build  
✅ **Usuario no-root**: Mejora seguridad en runtime  
✅ **Limpia en cada RUN**: Elimina cachés y temporales en el mismo comando  
✅ **Imágenes base mínimas**: Usa alpine, slim o distroless cuando sea posible  
✅ **Combina comandos RUN**: Reduce el número de capas  

❌ **Evita COPY . . al inicio**: Invalida todo el caché  
❌ **No dejes secretos en capas intermedias**: Usa build secrets o multi-stage  
❌ **No instales paquetes innecesarios**: Solo lo estrictamente necesario para runtime