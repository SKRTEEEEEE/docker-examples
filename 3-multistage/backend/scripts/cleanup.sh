#!/bin/bash

echo "🧹 Cleaning up Docker resources..."

# Detener y eliminar contenedores
docker rm -f rust-api mongo 2>/dev/null

# Eliminar imagen
docker rmi rust-todo-api 2>/dev/null

# Eliminar volumen
docker volume rm mongo-data 2>/dev/null

echo "✓ Cleanup complete!"