

---

# To Do List - Full Stack App

Este es un proyecto de **To Do List** creado como parte de mi formación en desarrollo web Full Stack. La aplicación permite crear, guardar y gestionar notas de manera dinámica. Utiliza **React** en el frontend y un servidor backend con **Node.js** y **Express** para manejar las solicitudes de notas. Los datos se guardan en una base de datos MongoDB.

## Características

- **Crear y guardar notas**: Los usuarios pueden agregar notas con título y descripción.
- **Gestión de notas**: Permite la edición, eliminación y visualización de notas.
- **Arrastre y movimiento de las notas**: Las notas pueden ser movidas dentro de la pantalla mediante una funcionalidad de arrastrar y soltar.
- **Animaciones**: Al guardar una nota, la interfaz realiza una animación para ocultar la caja de texto de la nota, mostrando un efecto visual atractivo.

## Tecnologías utilizadas

- **Frontend**: React, [Framer Motion](https://motion.dev/docs/react-reorder)
- **Backend**: Node.js, Express
- **Base de datos**: MongoDB
- **Estilos**: TailwindCSS
- **Iconos**: Lucide React

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/tuusuario/to-do-list.git
   ```

2. Instala las dependencias del frontend y backend:

   ```bash
   cd frontend
   npm install

   cd ../backend
   npm install
   ```

3. Inicia el servidor y la aplicación:

   ```bash
   # Iniciar backend
   cd backend
   npm start

   # Iniciar frontend
   cd frontend
   npm start
   ```

4. La aplicación estará disponible en `http://localhost:3000`.

## Contribuciones

¡Las contribuciones son bienvenidas! Si tienes alguna mejora o corrección, no dudes en hacer un pull request. Si tienes alguna pregunta o sugerencia, por favor abre un "issue" en GitHub.

---

