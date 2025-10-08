#!/bin/bash

echo "🐳 Docker Rust + MongoDB Exercise Setup"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Crear volumen para MongoDB
echo -e "${YELLOW}📦 Creating MongoDB volume...${NC}"
docker volume create mongo-data
echo -e "${GREEN}✓ Volume created: mongo-data${NC}"
echo ""

# Iniciar MongoDB
echo -e "${YELLOW}🍃 Starting MongoDB container...${NC}"
docker run -d \
  --name mongo \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  mongo:7
echo -e "${GREEN}✓ MongoDB running on port 27017${NC}"
echo ""

# Esperar a que MongoDB esté listo
echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
sleep 5
echo -e "${GREEN}✓ MongoDB ready${NC}"
echo ""

# Construir imagen de Rust
echo -e "${YELLOW}🦀 Building Rust application image...${NC}"
cd backend
docker build -t rust-todo-api .
cd ..
echo -e "${GREEN}✓ Image built: rust-todo-api${NC}"
echo ""

# Ejecutar aplicación Rust
echo -e "${YELLOW}🚀 Starting Rust API container...${NC}"
docker run -d \
  --name rust-api \
  -p 8080:8080 \
  -e MONGODB_URI=mongodb://mongo:27017 \
  --link mongo:mongo \
  rust-todo-api
echo -e "${GREEN}✓ Rust API running on port 8080${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Quick Commands:"
echo "  Health Check:  curl http://localhost:8080/health"
echo "  Get TODOs:     curl http://localhost:8080/todos"
echo "  Create TODO:   curl -X POST http://localhost:8080/todos -H 'Content-Type: application/json' -d '{\"title\":\"My task\",\"completed\":false}'"
echo ""
echo "🔍 View logs:"
echo "  MongoDB:       docker logs mongo"
echo "  Rust API:      docker logs rust-api"
echo ""
echo "🧹 Cleanup:"
echo "  ./scripts/cleanup.sh"