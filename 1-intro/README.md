# Introducción a Docker y Comandos Básicos

## 📚 Teoría y Conceptos Fundamentales

### ¿Qué es Docker?

Docker es una plataforma de contenedorización que permite empaquetar aplicaciones y sus dependencias en contenedores ligeros y portables. A diferencia de las máquinas virtuales, los contenedores comparten el kernel del sistema operativo host, lo que los hace más eficientes.

**Conceptos clave:**
- **Imagen**: Plantilla de solo lectura que contiene el sistema de archivos y la configuración necesaria para ejecutar una aplicación
- **Contenedor**: Instancia ejecutable de una imagen
- **Docker Hub**: Registro público de imágenes Docker (como GitHub para contenedores)
- **Volumen**: Mecanismo para persistir datos generados por contenedores

### Docker Hub

Docker Hub es el registro público más grande de imágenes Docker. Puedes buscar imágenes oficiales y de la comunidad:
- Sitio web: [hub.docker.com](https://hub.docker.com)
- Imágenes oficiales tienen una marca de verificación
- Cada imagen tiene tags (versiones), por ejemplo: `nginx:latest`, `nginx:1.25`

---

## 🎯 Comandos Básicos de Docker

### 1. `docker run` - Ejecutar un contenedor

El comando más fundamental. Descarga la imagen (si no existe localmente) y ejecuta un contenedor.

**Sintaxis básica:**
```bash
docker run <opciones> <imagen> <comando>
```

**Ejemplo simple:**
```bash
docker run nginx
```

**Flags importantes:**

| Flag | Descripción | Ejemplo |
|------|-------------|---------|
| `-d` | Detached mode (segundo plano) | `docker run -d nginx` |
| `-p` | Mapear puertos (host:contenedor) | `docker run -p 8080:80 nginx` |
| `--name` | Nombre personalizado al contenedor | `docker run --name mi-nginx nginx` |
| `-v` | Montar volúmenes (host:contenedor) | `docker run -v /ruta/local:/ruta/contenedor nginx` |
| `--rm` | Eliminar contenedor al detenerse | `docker run --rm nginx` |
| `-it` | Modo interactivo con terminal | `docker run -it ubuntu bash` |
| `-e` | Variables de entorno | `docker run -e VARIABLE=valor nginx` |

**Ejemplo completo linux:**
```bash
docker run -d -p 8080:80 --name mi-web -v $(pwd)/site:/usr/share/nginx/html:z nginx
```
[**Ejemplo completo bash windows**](#-git-bash-en-windows-problema-de-conversión-de-rutas)


### 2. `docker ps` - Listar contenedores

Lista los contenedores en ejecución.

**Ver contenedores activos:**
```bash
docker ps
```

**Ver todos los contenedores (incluidos los detenidos):**
```bash
docker ps -a
```

**Formato personalizado:**
```bash
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"
```

### 3. `docker logs` - Ver logs de un contenedor

Muestra la salida estándar (stdout/stderr) de un contenedor.

**Ver logs:**
```bash
docker logs <nombre-o-id-contenedor>
```

**Ejemplo:**
```bash
docker logs mi-web
```

**Seguir logs en tiempo real:**
```bash
docker logs -f mi-web
```

**Ver últimas N líneas:**
```bash
docker logs --tail 50 mi-web
```

### 4. `docker exec` - Ejecutar comandos en un contenedor activo

Permite ejecutar comandos dentro de un contenedor en ejecución.

**Sintaxis:**
```bash
docker exec <opciones> <contenedor> <comando>
```

**Abrir una shell interactiva:**
```bash
docker exec -it mi-web bash
```

**Ejecutar un comando específico:**
```bash
docker exec mi-web ls /usr/share/nginx/html
```

**Ver contenido de un archivo:**
```bash
docker exec mi-web cat /etc/nginx/nginx.conf
```

### 5. Comandos adicionales útiles

**Detener un contenedor:**
```bash
docker stop mi-web
```

**Iniciar un contenedor detenido:**
```bash
docker start mi-web
```

**Eliminar un contenedor:**
```bash
docker rm mi-web
```

**Eliminar un contenedor en ejecución (forzado):**
```bash
docker rm -f mi-web
```

**Ver imágenes descargadas:**
```bash
docker images
```

**Eliminar una imagen:**
```bash
docker rmi nginx
```




## 🔧 Git Bash en Windows: Problema de conversión de rutas

### El problema con `$(pwd)` en Git Bash

Git Bash (MSYS2) tiene un comportamiento especial que causa problemas con Docker: **convierte automáticamente las rutas de estilo Unix a rutas de Windows**.

**¿Por qué falla `$(pwd)`?**

Cuando usas `$(pwd)` en Git Bash, obtienes una ruta como `/c/Users/usuario/proyecto`. Git Bash intenta "ayudarte" convirtiendo **AMBAS** partes de la ruta del volumen:
- Convierte `/c/Users/usuario/proyecto/site` → `C:\Users\usuario\proyecto\site` ✅ (esto está bien)
- Convierte `/usr/share/nginx/html` → `C:\usr\share\nginx\html` ❌ (esto rompe Docker)

Docker espera que la ruta del contenedor (`/usr/share/nginx/html`) se mantenga como está, pero Git Bash la convierte a una ruta de Windows que no existe dentro del contenedor.

### La solución: `MSYS_NO_PATHCONV=1`

Esta variable de entorno desactiva la conversión automática de rutas:

```bash
MSYS_NO_PATHCONV=1 docker run -d -p 8080:80 -v "$(pwd)/site:/usr/share/nginx/html" nginx
```

**Nota importante:** Las comillas `"$(pwd)/site:/usr/share/nginx/html"` son necesarias.

### Alternativa: Usar ruta absoluta de Windows

```bash
docker run -d -p 8080:80 -v "//c/Users/usuario/proyecto/site:/usr/share/nginx/html" nginx
```


## 💻 Ejercicio Práctico: Servidor Web con HTML, CSS y JS

### Descripción del ejercicio

Crearemos una aplicación web simple usando HTML, CSS y JavaScript, y la serviremos con Nginx **sin usar Dockerfile**, solo con `docker run` y montaje de volúmenes.

### Objetivos de aprendizaje

1. Ejecutar un contenedor Nginx
2. Exponer puertos para acceder desde el navegador
3. Montar un volumen local con el código fuente
4. Inspeccionar logs del contenedor
5. Ejecutar comandos dentro del contenedor
6. Comprender la estructura básica de una aplicación web




## 📝 Guía Paso a Paso

### Verificar Docker

Asegúrate de que Docker está instalado y en ejecución:
```bash
docker --version
```

Deberías ver algo como: `Docker version 24.0.x, build xxxxx`

### Ejecutar el contenedor

**En Linux:**
```bash
docker run -d -p 8080:80 --name mi-web -v $(pwd)/site:/usr/share/nginx/html:z nginx
```

**En PowerShell (Windows):**
```powershell
docker run -d -p 8080:80 --name mi-web -v ${PWD}/site:/usr/share/nginx/html nginx
```


**Explicación de los flags:**
- `-d`: Ejecuta en modo detached (segundo plano)
- `-p 8080:80`: Mapea el puerto 8080 del host al puerto 80 del contenedor
- `--name mi-web`: Asigna el nombre "mi-web" al contenedor
- `-v $(pwd)/site:/usr/share/nginx/html`: Monta la carpeta local `site` en la ruta donde Nginx busca archivos HTML
- `nginx`: La imagen a utilizar

### Verificar que el contenedor está corriendo

```bash
docker ps
```

Deberías ver algo como:
```
CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                  NAMES
abc123def456   nginx     "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds   0.0.0.0:8080->80/tcp   mi-web
```

### Acceder a la aplicación

Abre tu navegador y visita: [http://localhost:8080](http://localhost:8080)

Deberías ver la aplicación web con el contador interactivo.

### Ver los logs

```bash
docker logs mi-web
```

Para ver logs en tiempo real:
```bash
docker logs -f mi-web
```

### Ejecutar comandos dentro del contenedor

**Acceder al contenedor con bash:**
```bash
docker exec -it mi-web bash
```

Una vez dentro, puedes explorar:
```bash
# Ver los archivos del sitio
ls -la /usr/share/nginx/html

# Ver el contenido del index.html
cat /usr/share/nginx/html/index.html

# Ver la configuración de Nginx
cat /etc/nginx/nginx.conf

# Salir del contenedor
exit
```

**Ejecutar un comando sin entrar al contenedor:**
```bash
docker exec mi-web ls -la /usr/share/nginx/html
```

### Modificar la aplicación en tiempo real

1. Abre `site/index.html` en tu editor favorito
2. Cambia el título o algún texto
3. Guarda el archivo
4. Recarga la página en el navegador (F5)

Los cambios deberían aparecer inmediatamente gracias al volumen montado.

### Detener y limpiar

**Detener el contenedor:**
```bash
docker stop mi-web
```

**Eliminar el contenedor:**
```bash
docker rm mi-web
```

**O detener y eliminar en un solo comando:**
```bash
docker rm -f mi-web
```

---



## 📦 ¿Qué sucede al montar un volumen?

### Sintaxis del montaje de volúmenes

```bash
-v "ruta_host:ruta_contenedor"
```

Ejemplo:
```bash
-v "$(pwd)/site:/usr/share/nginx/html"
```

### ¿Qué está pasando aquí?

Cuando ejecutas este comando, Docker crea un "puente" entre dos sistemas de archivos:

**Ruta del host (tu máquina):**
- `$(pwd)/site` → Por ejemplo: `/c/Users/usuario/proyecto/site` (Git Bash) o `C:\Users\usuario\proyecto\site` (Windows)
- Esta carpeta contiene tus archivos: `index.html`, `styles.css`, `script.js`

**Ruta del contenedor:**
- `/usr/share/nginx/html` → Carpeta dentro del contenedor Linux donde Nginx busca los archivos HTML por defecto

### El proceso de montaje

1. **Docker monta la carpeta local** en la ubicación especificada del contenedor
2. **El contenedor "ve"** los archivos de tu máquina como si estuvieran dentro de él
3. **Los cambios son bidireccionales:**
   - Si modificas `index.html` en tu máquina → El cambio se refleja inmediatamente en el contenedor
   - Si el contenedor modifica un archivo → El cambio aparece en tu máquina

### Ventajas de usar volúmenes

✅ **Desarrollo en tiempo real:** Editas el código en tu editor favorito y los cambios se ven al instante  
✅ **Persistencia:** Los datos sobreviven aunque elimines el contenedor  
✅ **Separación:** El código está fuera del contenedor, facilitando el versionado con Git  
✅ **Sin rebuild:** No necesitas reconstruir la imagen cada vez que cambias el código

### Ejemplo práctico

```bash
# Sin volumen: Los archivos están dentro de la imagen, cualquier cambio requiere rebuild
docker run nginx

# Con volumen: Los archivos están en tu máquina, editas y recargas el navegador
MSYS_NO_PATHCONV=1 docker run -v "$(pwd)/site:/usr/share/nginx/html" nginx
```

**Nota:** El directorio `/usr/share/nginx/html` es la ubicación por defecto donde Nginx busca archivos estáticos. Al montar nuestro volumen ahí, "reemplazamos" el contenido predeterminado con nuestros propios archivos.



## 🐛 Solución de Problemas

### El puerto 8080 ya está en uso
**Error:** `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solución:** Usa otro puerto:
```bash
docker run -d -p 8081:80 --name mi-web -v $(pwd)/site:/usr/share/nginx/html nginx
```

### El contenedor no inicia
**Verificar:** ¿El nombre ya existe?
```bash
docker ps -a | grep mi-web
```

**Solución:** Elimina el contenedor antiguo:
```bash
docker rm -f mi-web
```



### [Error en Windows Bash con rutas](#-git-bash-en-windows-problema-de-conversión-de-rutas)
