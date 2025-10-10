
# 🚀 Docker + GitHub + IA

## 🧠 Cómo Empezar con Droid

### Primer prompt

El proyecto `base-build` del curso fue generado con la herramienta **Droid**, utilizando el siguiente prompt:

```text
Droid create me a app for manage sensores using docker with the next requeriments: 
Some backend build with nodejs and ts and a .http archive with http actions for test, 
some bdd with mongo in docker, 
some frontend with nextjs and ts that show the app
```

Este comando generó la estructura base del proyecto:

  * **Backend:** API REST en Node.js + TypeScript
  * **Base de datos:** MongoDB corriendo dentro de un contenedor Docker
  * **Frontend:** Aplicación Next.js + TypeScript
  * **Archivo `.http`:** para realizar pruebas locales de los endpoints del backend

### Guardar primera version

Una vez que Droid ha terminado y nos ha creado la estructura de la aplicación, el siguiente paso es **subir este código a un repositorio de GitHub** para empezar a versionarlo una vez comprobado que funcione.

Para ello, abre una **nueva terminal** dentro del directorio de la aplicación, inicializa Git con `git init`, y realiza tu primer *commit*. Después, para conectar y subir el código a tu repositorio remoto, GitHub nos indicará que usemos los siguientes comandos:

  * `git branch -M main`
  * `git remote add origin https://github.com/SKRTEEEEEE/docker-examples.git` (adaptando la URL a tu repositorio)
  * `git push -u origin main`

Se recomienda encarecidamente usar `main` como nombre para la rama principal y `origin` para el nombre del repositorio remoto, ya que son las convenciones estándar. Para más detalles sobre estos comandos, consulta la sección **"Comandos Básicos de GitHub"** más abajo.

En las siguientes secciones aprenderemos cómo adaptar, ejecutar y versionar este proyecto paso a paso.

### Mas prompt

```text
Okay, Droid, now I need to fix a few things in the app:
     - I need to implement a new backend, using Python or NodeJS for example, that mimics the code that will run on a Raspberry Pi. This code
     will create sensor data every 2 minutes. It will send it to the central backend via MQTT.
     - The central backend will be responsible for receiving the data, saving it to the database, and allowing new sensors to be listed.
     - The frontend allows adding new sensors and modifying their data (such as name and status), but not the value, which will come from the
     Raspberry Pi backend.
```


## 🧰 Comandos Básicos de GitHub

A continuación, algunos comandos esenciales para trabajar con Git y GitHub:

### 🔹 Inicializar un repositorio

```bash
git init
```

### 🔹 Agregar archivos al control de versiones

```bash
git add <nombre-de-la-carpeta-o-archivo>
```

  - Normalmente usaremos `git add .` para poner todos los archivos

### 🔹 Guardar los cambios

```bash
git commit -m "Mensaje del commit"
```

### 🔹 Conectar con un repositorio remoto

```bash
git remote add <nombre-del-remote> <repositorio-online>
```

  - `git remote add origin https://github.com/usuario/repositorio.git`

### 🔹 Subir cambios a GitHub

```bash
git push <nombre-del-remote> <nombre-de-la-rama>
```

  - `git push -u origin main`

### 🔹 Crear y cambiar de rama

```bash
git checkout -b <nombre-de-rama>
```

### 🔹 Clonar un repositorio existente

```bash
git clone [https://github.com/usuario/repositorio.git](https://github.com/usuario/repositorio.git)
```

### 🥳 Navegar por Git

```bash
git checkout <nombre-de-rama-o-numero-de-commit>
```

### 🔹 Ver los commits actuales -> `git log`
### 🔹 Ver los cambios pendientes -> `git status`


-----

> 💡 *Este README se irá ampliando con más secciones a medida que avancemos en el curso.*

-----

