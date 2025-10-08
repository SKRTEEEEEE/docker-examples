<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">

# Docker Github y IA
<a href="https://github.com/SKRTEEEEEE/upc">
<div align="center">
  <img  src="https://github.com/SKRTEEEEEE/upc/blob/main/Pictures/banner_robot.svg"
       alt="banner" />
</div>
</a>

## Información
Ejemplos de uso de Docker, acompañados de pequeñas guías para aprender la teoría y el uso de este, GitHub y la IA.

### [**Tema:** Introducción a Docker y Comandos Básicos.](./1-intro/README.md)
* **Conceptos Clave:** 
  * Instalación, docker-hub, conceptos
  * **`docker run <imagen>`** (ejecución simple), `docker ps`, `docker logs`.
  * Exponer puerto
  * `docker exec`
  * Ejemplo con html por comando

* **Ejercicio Práctico:** Ejecutar un contenedor nginx vinculado con un volumen al código html.

### [**Tema:** Profundizando en **`docker build`** y **`docker run`** con *flags* esenciales.](./2-dockerfile/backend.md)
* **Conceptos Clave:**
    * **`docker build`** Flags: (`--build-arg`, `.dockerignore`).
    * **`docker run`** Flags: (`-p`, `-d`, `--name`, `--rm`).
    * `docker ai` (intro)

  
* **Ejercicio Práctico:** Codear el `Dockerfile` y construir la imagen del backend del Módulo 2 con port forwarding, variables de entorno y ejecutarla en *detach mode* (`-d`) con mapeo de puertos (`-p`), nombre específico (`--name`) y otras flags. Hacer lo mismo con la parte del frontend. Utilizar network para hacer que las imágenes trabajen conjuntamente.




### [**Tema:** Directivas Esenciales del **Dockerfile**.](./2-dockerfile/frontend.md)
* **Conceptos Clave:** 
  * **`FROM`**, **`RUN`**, **`CMD`**, **`WORKDIR`**.
  * Como generar dockerfile automáticos
  * Profundizar en volúmenes

* **Ejercicio Práctico:** Hacer lo mismo que en el ejercicio anterior pero con la imagen del frontend.


### [**Tema:** Definiendo Servicios con **`compose.yml`**.](./2-dockerfile/compose.md)
* **Conceptos Clave:** 
  * Estructura del `compose.yml` (`version`, `services`), uso de la directiva `build` (en lugar de `image`), `ports`. Comandos **`docker compose up`** y **`down`**.
  * Para que sirve `.dockerignore` y como usarlo correctamente


* **Ejercicio Práctico:** Crear un `compose.yml` que reemplace el comando `docker run` de los módulos anteriores.


### **Tema:** Redes y Comunicación entre Servicios.
* **Conceptos Clave:** 
  * Directivas **`networks`**, **`depends_on`**, **`volumes`**, **`watch`** (montajes bind para desarrollo).
  
* **Ejercicio Práctico:** Crear una aplicación de dos servicios (ej. *Frontend* y *Backend* que se comunican internamente) usando la red por defecto de Compose. Montar el código local usando un volumen *bind* para desarrollo.


### **Tema:** Capas, *Caching* y Comandos de Ejecución de Aplicaciones.
* **Conceptos Clave:** 
  * **`AS`**
  * **`COPY`**, **`ADD`**, **`ENTRYPOINT`**, 
  * Optimizando capas (**Multistage builds**).
  * Uso de link
  
* **Ejercicio Práctico:** Migrar el `Dockerfile` de la aplicación anterior a un *Multistage Build* para separar las herramientas de compilación y reducir significativamente el tamaño de la imagen final.





### ✏️ **Tema:** Variables de Entorno y Volúmenes Nombrados.
* **Conceptos Clave:** Directivas **`environment`**, archivos **`.env`**, **`volumes`** (nombrados), **`restart`** policies.
* **Ejercicio Práctico:** Añadir una base de datos (ej. MySQL o Redis) al `compose.yml`, configurar su conexión con variables de entorno y usar **volúmenes nombrados** para asegurar que los datos persistan entre reinicios.
---



## [Recursos](https://github.com/SKRTEEEEEE/markdowns)

## Contacto

### [Pagina web del desarrollador](https://profile-skrt.vercel.app)
### [Envíame un mensaje](mailto:adanreh.m@gmail.com)

## Contribuciones y Problemas

Si encuentras problemas o deseas contribuir al proyecto, por favor, crea un issue en el repositorio.

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif">