# Etapa de construcción: instala dependencias Python
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirements.txt .
# --user: instala paquetes en ~/.local en lugar del sistema (más limpio para multi-stage)
# --no-cache-dir: no almacena caché de pip, reduce tamaño de imagen
RUN pip install --no-cache-dir --user -r requirements.txt

COPY . .

# Etapa final: imagen limpia con sólo lo necesario
FROM python:3.11-slim

WORKDIR /app

# Copia los paquetes Python instalados en .local desde builder
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app .

# Añade .local/bin al PATH para acceder a comandos instalados por pip
ENV PATH=/root/.local/bin:$PATH

EXPOSE 5000

CMD ["python", "app.py"]
