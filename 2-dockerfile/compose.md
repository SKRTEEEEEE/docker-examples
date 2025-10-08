# Ejercicio Práctico: Backend + Frontend + MongoDB con Docker Compose

## Objetivo

Configurar un entorno completo con **Backend (TS/Express)**, **Frontend (Vite/React)** y **MongoDB** usando `docker-compose`. Practicarás el uso de directivas básicas y comandos clave de Compose.

    🧠💡 Para ello se recomienda pensar en las flags que hemos utilizado en los pasos anteriores.

---

## Fundamentos Rápidos

### Directivas clave de `docker-compose.yml`

| Clave           | Función                                                    |
| :-------------- | :--------------------------------------------------------- |
| **services**    | Define cada contenedor (ej: backend, frontend, db).        |
| **build**       | Especifica contexto y Dockerfile para construir la imagen. |
| **image**       | Usa una imagen predefinida (ej: `mongo:latest`).           |
| **ports**       | Publica puertos host:contenedor.                           |
| **environment** | Define variables de entorno.                               |
| **volumes**     | Monta volúmenes para persistencia o código.                |
| **networks**    | Configura comunicación entre servicios.                    |
| **depends_on**  | Ordena la inicialización entre servicios.                  |

---

## Ejemplo genérico de `compose.yml`

```yaml
# version: "3.9" ❗ no es necesario

services:
  web-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.name # relativo a la ruta del context
    ports:
      - "3000:3000"               # Puerto local : puerto del contenedor
    depends_on:
      - api-backend
    networks:
      - app-network

  api-backend:
    build:
      context: ./backend
      dockerfile: ./src/Dockerfile.name # relativo a la ruta del context
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=mongodb://db-service:27017/app_database
      - PORT=8080
    depends_on:
      - db-service
    networks:
      - app-network

  db-service:
    image: mongo:latest
    volumes:
      - mongo-storage:/data/db    # Volumen nombrado para persistencia
    networks:
      - app-network

networks:
  app-network:                    # Red interna compartida entre servicios

volumes:
  mongo-storage:                  # Volumen para guardar los datos de MongoDB

```

---

## Comandos Básicos de Compose

| Comando                          | Uso                                                       |
| :------------------------------- | :-------------------------------------------------------- |
| `docker compose up`              | Levanta los servicios.                                    |
| `docker compose up -d`           | Ejecuta en segundo plano.                                 |
| `docker compose build`           | Reconstruye imágenes.                                     |
| `docker compose ps`              | Lista servicios activos.                                  |
| `docker compose logs <servicio>` | Muestra logs.                                             |
| `docker compose down`            | Detiene y elimina contenedores, red y volúmenes anónimos. |


<details>
<summary>🤔 ¿Qué es un volumen anónimo?</summary>

### 🧩 Ejemplo

```yaml
services:
  app:
    image: node:22
    volumes:
      - /usr/src/app/node_modules
      - ./src:/usr/src/app
```

👉 Aquí, el primer volumen (`/usr/src/app/node_modules`) **no tiene nombre**.
Docker crea **un volumen anónimo** para esa ruta (algo como `8f0b43d2a6f4bcd8d6a...`).

Si luego ejecutas:

```bash
docker compose down
```

➡️ Docker:

* Detiene los contenedores
* Elimina la red interna
* **Borra esos volúmenes anónimos**, ya que no están nombrados ni declarados en la sección `volumes:` del archivo.

---

### 📦 En cambio, los volúmenes *nombrados* **no se eliminan** por defecto:

```yaml
services:
  db:
    image: mongo
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

En este caso, si ejecutas:

```bash
docker compose down
```

El volumen `mongo-data` se mantiene.
Solo se eliminaría si ejecutas:

```bash
docker compose down -v
```

---

### 🧠 Resumen rápido

| Tipo de volumen                       | Se elimina con `docker compose down` | Se mantiene       |
| ------------------------------------- | ------------------------------------ | ----------------- |
| **Anónimo** (no nombrado)             | ✅ Sí                                 | ❌ No              |
| **Nombrado** (definido en `volumes:`) | ❌ No                                 | ✅ Sí (salvo `-v`) |


</details>

---

## Persistencia y Redes

* **Volumen `mongo-data`** guarda datos de MongoDB aunque el contenedor se reinicie.
* **Red `ts-mongo-net`** permite que backend y frontend usen el nombre del servicio (`mongodb-container`) como host.

---

## Prueba Rápida

1. Ejecuta:

   ```bash
   docker compose up -d
   ```
2. Abre el **Frontend** en `http://localhost:4173`.
3. El **Backend** responde en `http://localhost:5000`.
4. La API usa la base `notesdb` en MongoDB.


## 🧾 El Archivo `.dockerignore`

### ¿Qué es?

`.dockerignore` es un archivo que indica a Docker **qué archivos o carpetas no deben copiarse** al contexto de construcción de la imagen.

### Ejemplo:

```
node_modules
dist
.env
.git
.DS_Store
```

### ¿Por qué es importante?

| Razón                                      | Beneficio                                           |
| :----------------------------------------- | :-------------------------------------------------- |
| **Reduce el tamaño del contexto de build** | Las construcciones son más rápidas.                 |
| **Evita incluir archivos sensibles**       | Protege variables o llaves secretas.                |
| **Mantiene imágenes más limpias**          | No se copian dependencias ni archivos innecesarios. |

En resumen, `.dockerignore` funciona igual que `.gitignore`, pero aplicado al proceso de construcción de imágenes. Su correcto uso mejora el rendimiento y la seguridad del entorno Docker.
