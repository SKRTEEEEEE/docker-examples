# Ejercicio Práctico: Backend Rust + MongoDB SIN Compose

## Objetivo

Configurar y probar una API backend Rust junto a MongoDB usando Docker y sus comandos clave, entendiendo el uso práctico de FROM, RUN, CMD y WORKDIR en Dockerfile y gestionando la comunicación entre servicios de forma manual desde la terminal.

## Practica

### 1. Fundamentos: Dockerfile Esencial

Un `Dockerfile` es un archivo de recetas que define cómo se construye una imagen personalizada. Repasemos las cuatro directivas esenciales:

- **FROM**: Define la imagen base sobre la que construirás tu contenedor (en este caso, Rust oficial).[3][9]
- **RUN**: Ejecuta comandos necesarios durante la construcción de la imagen. Ejemplo: instalar dependencias, construir binarios, preparar carpetas.[10][3]
- **WORKDIR**: Fija el directorio de trabajo donde se realizarán las operaciones subsecuentes. Si no existe, se crea automáticamente.[11][3]
- **CMD**: Comando de arranque que se ejecutará cada vez que inicies el contenedor. Se puede sobrescribir desde la terminal.[12][3]
- **COPY**/**ADD**: Copian archivos locales al contenedor para usarlos en el build o runtime. ADD permite extra e URLs, pero se recomienda COPY en la mayoría de los casos.[12]

#### Dockerfile para Backend Rust
```dockerfile
# backend/Dockerfile
FROM rust:1.72-slim
WORKDIR /app
COPY . .
RUN cargo build --release
CMD ["./target/release/backend"]
```
Esta imagen compila y ejecuta el backend usando el binario Rust construido en modo release.

***

### 2. Levantar MongoDB con Docker

#### Comando para iniciar el contenedor MongoDB:

```bash
docker run --name mongodb-container -d -p 27017:27017 mongo:latest
```
- **--name**: Nombre personalizado para el contenedor (puede llamarse "mongo").
- **-d**: Ejecuta en segundo plano (detached).
- **-p 27017:27017**: Expone el puerto nativo de MongoDB en el host y el contenedor.
- Si tu backend busca `mongodb://mongo:27017` y no usas compose, asegúrate de configurar la variable `MONGODB_URI=mongodb://host.docker.internal:27017` si la app corre en otro contenedor en Docker Desktop (esto es importante en Windows y Mac).[2][5]
- Si estás en Linux y ambos contenedores están en la misma máquina, puedes usar el nombre del contenedor como host: `mongodb://mongodb-container:27017`.

***

### 3. Construir y probar el backend

#### Construye la imagen del backend:

```bash
docker build -t rust-backend ./backend
```
- **-t**: Nombre/tag para la imagen Docker.

#### Ejecuta el contenedor backend, enlazando a MongoDB:

```bash
docker run --name rust-backend -d -p 8080:8080 \
  --env MONGODB_URI=mongodb://host.docker.internal:27017 \
  --env PORT=8080 rust-backend
```
- **--env**: Inyecta variables de entorno necesarias para la app.
- **host.docker.internal**: Recomendado si MongoDB está en el host o en Docker Desktop/WSL.
- Alternativamente, si ambos contenedores están en la misma red personalizada:
  1. Crea una red docker:
     ```bash
     docker network create rust-mongo-net
     ```
  2. Lanza MongoDB en esa red:
     ```bash
     docker run --name mongodb-container --network rust-mongo-net -d -p 27017:27017 mongo:latest
     ```
  3. Lanza backend en la misma red:
     ```bash
     docker run --name rust-backend --network rust-mongo-net -d -p 8080:8080 \
       --env MONGODB_URI=mongodb://mongodb-container:27017 \
       --env PORT=8080 rust-backend
     ```
- Así, el backend puede comunicarse con "mongodb-container" por nombre en la red personalizada.[5]

***

### 4. Comandos importantes

- **Ver contenedores activos**:
  - `docker ps`
- **Ver logs del backend**:
  - `docker logs rust-backend`
- **Parar y eliminar contenedores**:
  - `docker stop rust-backend && docker rm rust-backend`
  - `docker stop mongodb-container && docker rm mongodb-container`
- **Acceder al shell del contenedor MongoDB**:
  - `docker exec -it mongodb-container mongosh`
- **Eliminar imágenes**:
  - `docker rmi rust-backend`

***

### 5. Diferencias Linux Bash vs Bash Windows

- En Bash de Windows (cmd/powershell) puedes necesitar rutas absolutas tipo `C:\ruta\del\proyecto`, mientras que en Linux se usan rutas tipo `/home/user/proyecto`.
- El comando `host.docker.internal` sólo está disponible en Docker Desktop (Windows/Mac). En Linux debes crear una red personalizada y usar el nombre del contenedor como host (recomendado en la mayoría de despliegues de producción).[13][14][5]
- Las variables de entorno se pasan igual en ambos sistemas.

***

### 6. Diferencias Docker vs Podman

- Casi todos los comandos son idénticos: puedes cambiar `docker` por `podman`.
- Podman permite modo rootless (sin sudo), útil en Linux.
- Para networking, Podman crea por defecto redes separadas por usuario; a veces deberás asegurar que los contenedores pueden verse (ver docs si necesitas que diferentes usuarios/forks compartan red).
- Podman soporta `--network` y la mayoría de flags igual que Docker.[15][16][17][18]

***

Este ejercicio permite practicar Dockerfile y networking directo entre contenedores sin depender de `compose.yml`, fortaleciendo el conocimiento de gestión y pruebas manuales de imágenes y contenedores.[9][16][3][5][15][12]

[1](https://www.youtube.com/watch?v=sCbeax5YrlA)
[2](https://serverspace.io/es/support/help/how-to-install-and-configure-mongodb-in-docker/)
[3](https://www.binarycoffee.dev/post/desplegar-proyecto-en-rust-con-docker)
[4](https://www.youtube.com/watch?v=jNzz_4hMvsw)
[5](https://www.ionos.com/es-us/digitalguide/servidores/configuracion/mongodb-docker-container/)
[6](https://es.linkedin.com/learning/nodejs-restserver-con-clean-architecture/configurar-mongodb-con-docker)
[7](https://www.youtube.com/watch?v=EXI0s45iGmk)
[8](https://www.reddit.com/r/rust/comments/1bviuyg/a_practical_guide_to_containerize_rust/)
[9](https://www.codearco.net/tutoriales/varios/tutorial-dockerfile-ejemplos-practicos-crear-imagenes/)
[10](https://www.campusmvp.es/recursos/post/mejores-practicas-para-crear-dockerfiles-excelentes.aspx)
[11](https://keepcoding.io/blog/que-es-dockerfile-workdir/)
[12](https://www.ionos.com/es-us/digitalguide/servidores/know-how/dockerfile/)
[13](https://proyectoa.com/desplegar-contenedor-docker-con-mongodb/)
[14](https://consultorjava.com/blog/podman-vs-docker-por-que-podman-es-la-alternativa-ideal/)
[15](https://www.campusmvp.es/recursos/post/docker-o-podman-similitudes-diferencias-ventajas-e-inconvenientes-a-la-hora-de-manejar-contenedores.aspx)
[16](https://www.reddit.com/r/linuxadmin/comments/xk62ak/docker_vs_podman_which_one_is_worth_doing_a_dive/)
[17](https://iconotc.com/docker-vs-podman/)
[18](https://dev.to/roxsross/docker-vs-podman-todo-lo-que-necesitas-saber-2b75)