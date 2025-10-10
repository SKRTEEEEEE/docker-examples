# Etapa de construcción: instala dependencias de producción
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# --omit=dev: instala sólo dependencias de producción, excluyendo devDependencies
RUN npm install --omit=dev

COPY . .

# Etapa final: imagen limpia con node_modules optimizado
FROM node:20-alpine

WORKDIR /app

# Copia la aplicación completa con node_modules desde builder
COPY --from=builder /app .

EXPOSE 3000

# USER node: ejecuta como usuario no-root por seguridad
USER node

CMD ["node", "index.js"]
