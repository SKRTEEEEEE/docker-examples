#!/bin/bash

# Script para explicar y ejecutar el workflow de Docker Compose
# Incluye eliminación de contenedores, construcción y ejecución
# tanto para el compose estándar como para el compose de desarrollo

echo "=== STEP 1: Detener y eliminar contenedores del compose estándar ==="
docker compose down
echo "Contenedores y red eliminados ✅"

echo ""
echo "=== STEP 2: Construir y levantar contenedores del compose estándar ==="
docker compose up --build -d
echo "Contenedores levantados y construidos ✅"
echo " - Backend corriendo en http://localhost:5000"
echo " - Frontend corriendo en http://localhost:4173"

echo ""
echo "=== STEP 3: Detener y eliminar contenedores del compose estándar nuevamente ==="
docker compose down
echo "Contenedores y red eliminados ✅"

echo ""
echo "=== STEP 4: Ejecutar compose de desarrollo (compose.dev.yml) en modo watch ==="
docker compose -f compose.dev.yml down  # Primero nos aseguramos de eliminar cualquier contenedor previo
docker compose -f compose.dev.yml watch
echo "Compose de desarrollo iniciado en modo watch ✅"
echo " - Backend corriendo en http://localhost:5000"
echo " - Frontend corriendo en http://localhost:5173"
echo " - Proxy corriendo en http://localhost"


echo ""
echo "=== Workflow completado ==="
