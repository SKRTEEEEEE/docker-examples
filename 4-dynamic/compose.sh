#!/bin/bash

echo "🐳 Docker Compose Workflow"
echo "==========================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ruta del proyecto (opcional)
PROJECT_DIR="$(pwd)"
COMPOSE_FILE="$PROJECT_DIR/compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo -e "${RED}❌ compose.yml no encontrado en el directorio actual.${NC}"
  exit 1
fi

echo -e "${YELLOW}📁 Using compose file:${NC} $COMPOSE_FILE"
echo ""

# Función para mostrar menú
show_menu() {
  echo "Selecciona una opción:"
  echo "  1) 🟢 Levantar contenedores (docker compose up -d)"
  echo "  2) 🔴 Detener y eliminar contenedores (docker compose down)"
  echo "  3) 🛠️ Reconstruir y levantar (docker compose up --build -d)"
  echo "  4) 🚪 Salir"
  echo "  -> 🏗️ Levantar para desarrollo (docker compose watch)"
  echo ""
}

# Loop principal
while true; do
  show_menu
  read -p "👉 Opción [1-4]: " option
  echo ""

  case $option in
    1)
      echo -e "${YELLOW}🚀 Starting containers...${NC}"
      docker compose up -d
      echo -e "${GREEN}✓ Containers are up and running${NC}"
      echo ""
      ;;
    2)
      echo -e "${YELLOW}🧹 Stopping and removing containers...${NC}"
      docker compose down
      echo -e "${GREEN}✓ Containers removed${NC}"
      echo ""
      ;;
    3)
      echo -e "${YELLOW}🔧 Rebuilding and starting containers...${NC}"
      docker compose up --build -d
      echo -e "${GREEN}✓ Containers rebuilt and started${NC}"
      echo ""
      ;;
    4)
      echo -e "${GREEN}👋 Exiting workflow.${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Opción no válida. Inténtalo de nuevo.${NC}"
      ;;
  esac
done
