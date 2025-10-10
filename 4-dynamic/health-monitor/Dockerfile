# Etapa de construcción: compila el binario de Go
FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

# CGO_ENABLED=0: desactiva CGO para crear un binario completamente estático sin dependencias de C
# -a: fuerza la reconstrucción de todos los paquetes
# -installsuffix cgo: distingue los paquetes compilados sin CGO
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o health-monitor .

# Etapa final: imagen mínima para ejecutar el binario
FROM alpine:latest

# ca-certificates: necesario para realizar peticiones HTTPS a feeds externos
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copia sólo el binario compilado desde la etapa builder
COPY --from=builder /app/health-monitor .

EXPOSE 8080

CMD ["./health-monitor"]
