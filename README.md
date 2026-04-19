# Gestor de Tareas - Proyecto Intermodular

Este proyecto es una aplicación web completa para la gestión de tareas, desarrollada con un enfoque en la experiencia de usuario (UX), diseño responsive y una arquitectura sólida basada en Flask.

## Tecnologías Utilizadas

- **Backend:** Python 3 + Flask.
- **Frontend:** HTML5, CSS3 (Grid y Flexbox), JavaScript.
- **Base de Datos:** SQLite / Integración vía API REST.

## Estructura del Proyecto

- **/backend**: Contiene el servidor Flask y la lógica de la aplicación.
  - **/static**: Contiene el frontend final e integrado (HTML, CSS y JS profesionales).
- **/docs**: Documentación técnica del proyecto.
  - **credenciales**: Archivo con el usuario y contraseña para acceder a la aplicación.
  - **/sql**: Contiene el archivo `schema.sql` con la estructura de las tablas de la base de datos.
- **/frontend_legacy**: Carpeta que contiene el código inicial conservado para documentar la evolución y el progreso del proyecto.

## Instalación y Ejecución

Para ejecutar este proyecto en un entorno local, sigue estos pasos:

1. **Instalar Flask**: Asegúrate de tener Python instalado y ejecuta:
   pip install flask

2. **Iniciar el servidor**: Navega hasta la carpeta principal del proyecto y ejecuta:
   python backend/app.py

3. **Acceder a la aplicación**: Abre tu navegador web y entra en:
   http://localhost:5000
