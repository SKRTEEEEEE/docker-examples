

# Ejercicio Práctico: Backend TS/Express + MongoDB SIN Compose

## Objetivo

Configurar y probar una API backend de Node.js/TypeScript junto a un contenedor de MongoDB. El objetivo es dominar:

1.  El uso de las directivas esenciales del **Dockerfile** (`FROM`, `RUN`, `CMD`, `WORKDIR`).
2.  La implementación de **Volúmenes Nombrados** para la persistencia de datos de MongoDB.
3.  La comunicación manual de red entre contenedores usando `docker network` y `docker run`.



## Fundamentos Teóricos: Directivas Esenciales y Volúmenes

### Directivas Esenciales del `Dockerfile`

| Directiva | Propósito | Ejemplo Práctico (TS Backend) |
| :--- | :--- | :--- |
| **FROM** | Define la **imagen base** sobre la que se construirá la tuya. Es siempre la primera instrucción. | `FROM node:20-alpine` (Imagen ligera de Node.js) |
| **WORKDIR** | Establece el **directorio de trabajo** para cualquier instrucción subsiguiente (`RUN`, `CMD`, `COPY`, etc.). Si no existe, se crea. | `WORKDIR /usr/src/app` |
| **COPY** | Copia archivos o directorios locales desde el contexto de construcción al contenedor. | `COPY package*.json ./` (Copia los manifiestos de dependencia) |
| **RUN** | Ejecuta un comando **durante el proceso de construcción de la imagen** (crea una nueva capa). Se usa para instalar paquetes, compilar código o configurar el entorno. | `RUN npm install` o `RUN npm run build` (Compilación de TypeScript) |
| **CMD** | Establece el **comando por defecto** que se ejecutará al iniciar el contenedor. Solo puede haber uno por `Dockerfile`. Puede ser sobrescrito por `docker run`. | `CMD ["npm", "start"]` (Ejecuta la aplicación Node.js) |

### Profundización en Volúmenes: Persistencia (SIN repetir lo básico)

Los volúmenes son la forma preferida de Docker para persistir datos fuera del sistema de archivos del contenedor, asegurando que la información de tu base de datos no se pierda al eliminar o recrear el contenedor.

#### A. Volúmenes Nombrados (Named Volumes)

Son la mejor opción para bases de datos como MongoDB.

  * **¿Qué son?** Son volúmenes gestionados por Docker. Se almacenan en una parte del sistema de archivos del host (generalmente `/var/lib/docker/volumes/` en Linux) que Docker gestiona completamente.
  * **Uso Principal:** **Persistencia de datos** de contenedores (ej. la carpeta `/data/db` de MongoDB).
  * **Comando Clave (`docker run -v`):**
      * Sintaxis: `-v <nombre-volumen>:<ruta-en-contenedor>`
      * Ejemplo: `-v mongo-data:/data/db`
      * Si el volumen `mongo-data` no existe, Docker lo crea automáticamente.

#### B. Montajes de Enlace (Bind Mounts)

  * **Uso Principal:** Enlazar código fuente local con el contenedor para **desarrollo y hot-reloading**.
  * **Comando Clave (`docker run -v`):**
      * Sintaxis: `-v <ruta-en-host>:<ruta-en-contenedor>`
      * Ejemplo: `-v $(pwd)/backend:/usr/src/app` (Enlaza el código fuente actual al *WORKDIR* del contenedor)

**En este ejercicio, utilizaremos un Volumen Nombrado para el contenedor de MongoDB.**


##  Comandos Prácticos y Prueba de Conexión

Para que el backend y MongoDB se comuniquen, necesitamos configurar una **red personalizada** de Docker.

### Paso 1: Crear la Red Personalizada 🕸️

**Objetivo:** Crear una red que permita a los contenedores resolver a otros por su nombre.

```bash
docker network create ts-mongo-net
```

### Paso 2: Iniciar MongoDB con Persistencia 💾

**Objetivo:** Levantar MongoDB en la red personalizada y usar el **Volumen Nombrado** `mongo-data`.

```bash
docker run -d \
  --name mongodb-container \
  --network ts-mongo-net \
  -v mongo-data:/data/db \
  mongo:latest
```

### Paso 3: Construir la Imagen del Backend 🛠️

**Objetivo:** Construir la imagen `ts-backend` usando el `Dockerfile` ubicado en `./backend`.

```bash
docker build -t ts-backend ./backend
```

### Paso 4: Ejecutar el Contenedor Backend 🚀

**Objetivo:** Ejecutar la aplicación, conectarla a la red y pasar la variable de entorno de conexión (`MONGODB_URI`).

  🧠 Recuerda mirar como se llama la variable de entorno - ¿ `mongodb://localhost:27017/` ? -- 🧑‍🎓 ¿ la configuras en tu contenedor o en el código ?  

```bash
docker run -d \
  --name ts-backend \
  --network ts-mongo-net \
  -p 5000:5000 \
  -e PORT=5000 \
  -e MONGODB_URI=mongodb://mongodb-container:27017/notesdb \
  ts-backend
```

  * **Clave de Conexión:** Observa que en `MONGODB_URI` usamos el nombre del contenedor de la base de datos (`mongodb-container`) como el *hostname* (host), gracias a la red compartida `ts-mongo-net`.

### Comandos de Inspección y Limpieza

| Comando | Función | Ejemplo |
| :--- | :--- | :--- |
| `docker logs` | Ver la salida de la aplicación (fundamental para debugging). | `docker logs ts-backend` |
| `docker ps` | Verificar que ambos contenedores estén en estado `Up`. | `docker ps` |
| `docker stop/rm` | Limpieza de contenedores. | `docker stop ts-backend mongodb-container && docker rm ts-backend mongodb-container` |
| `docker network rm/volume rm` | Limpieza de recursos. | `docker network rm ts-mongo-net` |

-----

## 🏗️ Diferencias entre Entornos 

### 1. Bash de Linux vs. Terminales de Windows (Bash/PowerShell)

El uso de **redes personalizadas** (`ts-mongo-net`) es el método más coherente y que funciona de manera idéntica tanto en Linux Bash como en Windows (Docker Desktop o WSL), ya que ambos contenedores se conectan por el alias interno de Docker (`mongodb-container`).

La principal diferencia se mantiene en la sintaxis para **Bind Mounts** (si quisieras montar código en desarrollo) y el uso de rutas:

| Aspecto | Linux Bash (Tradicional) | Windows (Bash/WSL/PowerShell) |
| :--- | :--- | :--- |
| **Conexión entre Contenedores** | Nombre del contenedor: `mongodb-container`. | Nombre del contenedor: `mongodb-container`. |
| **Sintaxis de Bind Mounts** | `-v $(pwd)/backend:/app` (uso de `$(pwd)`). | **PowerShell:** `-v ${PWD}/backend:/app`. **CMD:** `-v %cd%/backend:/app`. |

### 2. Docker vs. Podman

Recuerda que Podman busca ser un reemplazo directo de Docker, por lo que la mayoría de los comandos que acabamos de usar son compatibles:

| Comando Docker | Comando Podman | Observación |
| :--- | :--- | :--- |
| `docker build -t ts-backend ./backend` | `podman build -t ts-backend ./backend` | `podman build` es idéntico. |
| `docker run -d --network ts-mongo-net ...` | `podman run -d --network ts-mongo-net ...` | Las redes y los volúmenes funcionan de manera similar, pero Podman ejecuta todo en **modo rootless** por defecto (sin necesidad de un demonio root), lo que mejora la seguridad. |
| `docker network create ts-mongo-net` | `podman network create ts-mongo-net` | Los comandos para gestionar redes son prácticamente los mismos. |

La mayor ventaja de usar **Podman** en Linux es la capacidad de ejecutar contenedores sin el demonio centralizado (`dockerd`), lo que reduce la superficie de ataque y permite la ejecución como un usuario sin privilegios de root.

**Resultado del Dockerfile** (ver Sección 2 - el Multi-Stage Build).

