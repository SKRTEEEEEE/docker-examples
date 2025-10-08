# Dockerfile para Aplicación Vite + React: Guía Detallada

## Análisis Línea por Línea

### 1. `FROM node:22.13.1-slim`

**¿Qué hace?**  
Define la **imagen base** desde la cual partimos. Es siempre la primera instrucción del Dockerfile.

**¿Por qué `node:22.13.1-slim`?**
- **`node:22.13.1`**: Versión específica de Node.js que coincide con tu entorno de desarrollo (especificado en tu Dockerfile original).
- **`-slim`**: Variante reducida de la imagen oficial de Node.js basada en Debian. Elimina paquetes innecesarios (compiladores, utilidades de desarrollo) reduciendo el tamaño de ~1GB a ~200MB.
- **Ventaja**: Imágenes más pequeñas = despliegues más rápidos y menor superficie de ataque.

**Alternativas:**
- `node:22.13.1-alpine` (aún más pequeña ~50MB, pero basada en Alpine Linux que puede tener problemas de compatibilidad con algunas dependencias nativas).
- `node:22.13.1` (imagen completa, más pesada pero con todas las herramientas).

---

### 2. `WORKDIR /app`

**¿Qué hace?**  
Establece `/app` como el **directorio de trabajo** para todas las instrucciones subsiguientes (`COPY`, `RUN`, `CMD`).

**¿Por qué `/app`?**
- **Convención estándar**: `/app` es el directorio más común para aplicaciones en contenedores.
- **Organización**: Mantiene tu código separado del sistema de archivos del contenedor base (`/bin`, `/usr`, etc.).
- **Creación automática**: Si `/app` no existe, Docker lo crea automáticamente.

**¿Qué pasa sin `WORKDIR`?**  
Todas las operaciones se ejecutarían en `/` (raíz del sistema de archivos), mezclando tu código con archivos del sistema operativo. Esto es:
- Desorganizado
- Peligroso (podrías sobrescribir archivos del sistema)
- Difícil de gestionar

**Efecto en otras instrucciones:**
```dockerfile
COPY . .       # Copia todo al directorio actual (/app)
RUN npm ci     # Se ejecuta en /app
CMD ["npm"]    # Se ejecuta desde /app
```

---

### 3. `COPY package.json package-lock.json ./`

**¿Qué hace?**  
Copia **solo** los archivos de manifiestos de dependencias (`package.json` y `package-lock.json`) desde tu máquina local al contenedor.

**¿Por qué copiar estos archivos primero y por separado?**  
Esta es una **optimización crítica** del sistema de **capas (layers)** de Docker.

#### Cómo Funciona el Sistema de Capas

Cada instrucción (`FROM`, `RUN`, `COPY`) crea una **capa** en la imagen. Docker cachea estas capas:
- Si una capa no cambia, Docker **reutiliza la caché**.
- Si una capa cambia, Docker **reconstruye esa capa y todas las siguientes**.

#### Escenario Sin Separación

```dockerfile
# ❌ MAL: Copiar todo de una vez
COPY . .
RUN npm ci
```

**Problema**: Cualquier cambio en el código fuente (un comentario, un estilo CSS) invalida la capa `COPY . .`, forzando a Docker a:
1. Copiar todo de nuevo
2. **Reinstalar todas las dependencias** (npm ci) aunque no hayan cambiado

**Resultado**: Builds lentos (reinstalando dependencias innecesariamente cada vez).

#### Escenario Con Separación (Nuestro Dockerfile)

```dockerfile
# ✅ BIEN: Copiar manifiestos primero
COPY package.json package-lock.json ./
RUN npm ci              # Esta capa se cachea si los manifiestos no cambian
COPY . .                # Solo se invalida si cambia el código
RUN npm run build
```

**Beneficio**: Si cambias código fuente pero NO las dependencias:
- Docker reutiliza la capa `npm ci` de la caché
- Solo recompila tu código (`npm run build`)
- **Builds 10-50x más rápidos**

---

### 4. `RUN npm ci`

**¿Qué hace?**  
Instala las dependencias del proyecto **durante la construcción de la imagen**.

**¿Por qué `npm ci` y no `npm install`?**

| Aspecto | `npm ci` | `npm install` |
|---------|----------|---------------|
| **Velocidad** | 2-10x más rápido | Más lento |
| **Determinismo** | Instala versiones exactas del `package-lock.json` | Puede actualizar dependencias menores |
| **Modificación de archivos** | **Nunca** modifica `package-lock.json` | Puede actualizar el lock file |
| **Eliminación previa** | Elimina `node_modules` antes de instalar | Intenta reutilizar dependencias existentes |
| **Uso** | **CI/CD y producción** | Desarrollo local |

**En Docker**: Siempre usa `npm ci` porque:
- Garantiza builds reproducibles
- Es más rápido
- Previene discrepancias entre entornos

**¿Qué instala?**  
Todo lo que está en `dependencies` + `devDependencies` porque necesitamos:
- **dependencies**: Las librerías que usa tu app (React, React-DOM, Framer Motion, etc.)
- **devDependencies**: Herramientas de build necesarias (Vite, TypeScript, plugins de Vite, etc.)

---

### 5. `COPY . .`

**¿Qué hace?**  
Copia **todo el código fuente** desde tu directorio local (el contexto de build) al contenedor.

**¿Por qué DESPUÉS de instalar dependencias?**
- Ya explicado arriba: optimización de capas de caché
- Las dependencias cambian raramente
- El código fuente cambia constantemente

**¿Qué se copia exactamente?**
- Todo lo que NO esté en `.dockerignore`
- Típicamente: `src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig.json`, etc.

**Tip**: Crea un archivo `.dockerignore` para excluir:
```
node_modules
dist
.git
.env
*.log
```

---

### 6. `RUN npm run build`

**¿Qué hace?**  
Ejecuta el script de build definido en `package.json`: `"build": "tsc -b && vite build"`

**Proceso interno:**
1. **TypeScript Compilation** (`tsc -b`):
   - Compila archivos `.ts` y `.tsx` a JavaScript
   - Verifica tipos estáticos
   - Genera archivos `.js` en la carpeta de salida

2. **Vite Build** (`vite build`):
   - Empaqueta todos los archivos (JS, CSS, imágenes)
   - Optimiza el código (minificación, tree-shaking)
   - Genera archivos estáticos listos para producción en `dist/`
   - Crea hashes en nombres de archivos para cache busting (`app.abc123.js`)

**¿Por qué dentro del Dockerfile y no localmente?**
- **Consistencia**: Garantiza que el build se ejecute en el mismo entorno cada vez
- **Inmutabilidad**: La imagen resultante contiene exactamente lo que necesita
- **Portabilidad**: Cualquiera puede construir la imagen sin configurar Node.js localmente

**Resultado**: Se crea la carpeta `dist/` con los archivos estáticos optimizados.

---

### 7. `ENV NODE_ENV=production`

**¿Qué hace?**  
Establece la variable de entorno `NODE_ENV` a `production`.

**¿Por qué es importante?**
- **Optimizaciones**: Muchas librerías (incluido React) activan optimizaciones cuando detectan `NODE_ENV=production`:
  - React elimina advertencias de desarrollo
  - Se desactivan logs de debugging
  - Se mejora el rendimiento

- **Convención estándar**: Indica que el contenedor corre en modo producción

**Nota**: Esta variable está disponible para el proceso que ejecute el contenedor (el comando `CMD`).

---

### 8. `EXPOSE 4173`

**¿Qué hace?**  
Documenta que el contenedor escucha en el puerto **4173**.

**⚠️ IMPORTANTE: Es solo documentación**
- No abre puertos automáticamente
- No publica puertos al host
- Es metadatos para otros desarrolladores

**Para exponer realmente el puerto** debes usar `-p` al ejecutar:
```bash
docker run -p 4173:4173 mi-imagen
```

**¿Por qué 4173?**  
Es el puerto por defecto que usa `vite preview` para servir el build de producción.

---

### 9. `CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]`

**¿Qué hace?**  
Define el **comando por defecto** que se ejecuta cuando el contenedor arranca.

#### Desglose del Comando

```dockerfile
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
```

1. **`npm run preview`**:
   - Ejecuta el script `preview` de tu `package.json`: `"preview": "vite preview"`
   - `vite preview` inicia un servidor HTTP que sirve los archivos estáticos de `dist/`

2. **`--`**:
   - Separador de argumentos de npm
   - Todo lo que viene después se pasa directamente al comando subyacente (`vite preview`)

3. **`--host 0.0.0.0`**:
   - **CRÍTICO para Docker**: Hace que Vite escuche en todas las interfaces de red
   - **Por defecto**: Vite escucha solo en `localhost` (127.0.0.1)
   - **Problema sin esto**: No podrías acceder al contenedor desde fuera

#### ¿Por qué `0.0.0.0` es necesario?

**Dentro del contenedor:**
- `localhost` (127.0.0.1) se refiere al propio contenedor
- El host (tu máquina) no puede acceder a `localhost` del contenedor

**Con `0.0.0.0`:**
- El servidor escucha en todas las interfaces de red
- Docker puede mapear el puerto del contenedor al host
- Puedes acceder desde tu navegador en `http://localhost:4173`

#### Formato de Array vs String

```dockerfile
# ✅ RECOMENDADO: Formato exec (array)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]

# ❌ Formato shell (string) - NO recomendado
CMD npm run preview -- --host 0.0.0.0
```

**Ventajas del formato array:**
- No invoca un shell (`/bin/sh`)
- Más eficiente y limpio
- Señales (SIGTERM, SIGINT) se envían directamente al proceso
- Mejor manejo de paradas del contenedor

---

## ¿Por Qué NO Eliminar `node_modules`?

Tu Dockerfile original intentaba esto:

```dockerfile
# ❌ PROBLEMÁTICO
RUN rm -rf node_modules && npm ci --production
CMD ["npx", "vite", "preview", "--host", "0.0.0.0"]
```

**Problemas:**

1. **`npm ci --production`**: Solo instala `dependencies`, NO `devDependencies`
2. **Vite está en devDependencies**: Después de `npm ci --production`, Vite desaparece
3. **`npx vite preview`**: npm intenta descargar Vite temporalmente, pero falla al ejecutarlo

**Solución (nuestro Dockerfile):**  
Mantener `node_modules` completo porque `vite preview` necesita Vite y sus dependencias.

---

## Construcción y Ejecución

### Construir la Imagen

```bash
docker build -t mi-app-vite .
```

- `-t mi-app-vite`: Nombre (tag) de la imagen
- `.`: Contexto de build (directorio actual)

### Ejecutar el Contenedor

```bash
docker run -d \
  --name mi-app-container \
  -p 4173:4173 \
  mi-app-vite
```

- `-d`: Modo detached (segundo plano)
- `--name`: Nombre del contenedor
- `-p 4173:4173`: Mapea puerto del host (izquierda) al contenedor (derecha)

### Verificar Logs

```bash
docker logs mi-app-container
```

### Acceder a la Aplicación

Abre tu navegador en: `http://localhost:4173`

---

## Comparación: Docker vs Podman

| Aspecto | Docker | Podman |
|---------|--------|--------|
| **Comando de build** | `docker build -t app .` | `podman build -t app .` |
| **Comando de run** | `docker run -p 4173:4173 app` | `podman run -p 4173:4173 app` |
| **Demonio** | Requiere `dockerd` corriendo | Sin demonio (daemonless) |
| **Permisos** | Requiere root o grupo docker | Ejecución rootless por defecto |
| **Compatibilidad** | Estándar de facto | Compatible con comandos Docker |

**Ventaja de Podman**: Mayor seguridad al no requerir un demonio con privilegios root.
