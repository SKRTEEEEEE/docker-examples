

### **Tema:** Introducción a Docker y Comandos Básicos.
* **Conceptos Clave:** 
  * Instalación, docker-hub, conceptos
  * **`docker run <imagen>`** (ejecución simple), `docker ps`, `docker logs`.
  * Exponer puerto
  * `docker exec`
  * Ejemplo con html por comando

* **Ejercicio Práctico:** Ejecutar un contenedor "Hello World" y verificar su estado y logs.



### **Tema:** Directivas Esenciales del **Dockerfile**.
* **Conceptos Clave:** 
  * **`FROM`**, **`RUN`**, **`CMD`**, **`WORKDIR`**.
  * Como generar dockerfile automáticos
  * Profundizar en volumenes

* **Ejercicio Práctico:** Crear un Dockerfile para una app simple (ej. Node.js o Python) e introducir el comando **`docker build -t`** para generar la primera imagen personalizada.


### **Tema:** Profundizando en **`docker build`** y **`docker run`** con *flags* esenciales.
* **Conceptos Clave:**
    * **`docker build`** Flags: (`--build-arg`, `.dockerignore`).
    * **`docker run`** Flags: (`-p`, `-d`, `--name`, `--rm`).
    * `docker ai` (intro)

  
* **Ejercicio Práctico:** Construir la imagen de la app del Módulo 2 con variables de entorno de compilación (usando `--build-arg`) y ejecutarla en *detach mode* (`-d`) con mapeo de puertos (`-p`) y nombre específico (`--name`).



### **Tema:** Definiendo Servicios con **`compose.yml`**.
* **Conceptos Clave:** 
  * Estructura del `compose.yml` (`version`, `services`), uso de la directiva `build` (en lugar de `image`), `ports`. Comandos **`docker compose up`** y **`down`**.
  * 


* **Ejercicio Práctico:** Crear un `compose.yml` que reemplace el comando `docker run` del Módulo 3, levantando la aplicación con un solo comando de Compose.


### **Tema:** Redes y Comunicación entre Servicios.
* **Conceptos Clave:** 
  * Directivas **`networks`**, **`depends_on`**, **`volumes`** (montajes bind para desarrollo).
* **Ejercicio Práctico:** Crear una aplicación de dos servicios (ej. *Frontend* y *Backend* que se comunican internamente) usando la red por defecto de Compose. Montar el código local usando un volumen *bind* para desarrollo.


### **Tema:** Capas, *Caching* y Comandos de Ejecución de Aplicaciones.
* **Conceptos Clave:** **`COPY`**, **`ADD`**, **`ENTRYPOINT`**, Optimizando capas (**Multistage builds**).
* **Ejercicio Práctico:** Migrar el `Dockerfile` de la aplicación anterior a un *Multistage Build* para separar las herramientas de compilación y reducir significativamente el tamaño de la imagen final.





### **Tema:** Variables de Entorno y Volúmenes Nombrados.
* **Conceptos Clave:** Directivas **`environment`**, archivos **`.env`**, **`volumes`** (nombrados), **`restart`** policies.
* **Ejercicio Práctico:** Añadir una base de datos (ej. MySQL o Redis) al `compose.yml`, configurar su conexión con variables de entorno y usar **volúmenes nombrados** para asegurar que los datos persistan entre reinicios.
---

