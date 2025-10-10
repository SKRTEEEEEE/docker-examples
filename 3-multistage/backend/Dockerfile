# ==============================
# STAGE 1: Builder
# ==============================
FROM rust:1.83-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias primero (mejor aprovechamiento del cache)
COPY Cargo.toml Cargo.lock ./

# Crear directorio src temporal y compilar solo dependencias (cache layer)
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copiar el código fuente real
COPY src ./src

# Recompilar con el código real
# Touch para forzar recompilación del binario (las deps ya están cacheadas)
RUN touch src/main.rs && cargo build --release

# ==============================
# STAGE 2: Runtime
# ==============================
FROM debian:bookworm-slim AS runtime

WORKDIR /app

# Instalar solo las dependencias de runtime necesarias
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo el binario compilado desde el stage builder
COPY --from=builder /app/target/release/rust-todo-api /app/rust-todo-api

# Variables de entorno por defecto
ENV PORT=8080
ENV MONGODB_URI=mongodb://mongodb:27017
ENV RUST_LOG=info

# Exponer el puerto
EXPOSE 8080

# Usuario no-root para seguridad
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Usar ENTRYPOINT para el ejecutable y CMD para argumentos por defecto
ENTRYPOINT ["/app/rust-todo-api"]
