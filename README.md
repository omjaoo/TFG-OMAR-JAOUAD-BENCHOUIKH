# 🏡 Web de Venta y Alquiler de Propiedades

Este proyecto es un Trabajo de Fin de Grado (TFG) que consiste en el desarrollo de una plataforma web para la **gestión, publicación y visualización de propiedades en venta y alquiler**. Está construido utilizando tecnologías del ecosistema JavaScript y una arquitectura basada en servidor.

## 🚀 Tecnologías utilizadas

- **Node.js** – entorno de ejecución del lado del servidor
- **Express.js** – framework minimalista para crear el servidor web
- **EJS (Embedded JavaScript)** – motor de plantillas para renderizar vistas dinámicas
- **MongoDB** – base de datos NoSQL para almacenar información de propiedades, usuarios, etc.

## 📦 Instalación y ejecución

Sigue estos pasos para levantar el proyecto en tu entorno local:

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# 2. Instala las dependencias
npm install

# 3. Crea un archivo de entorno (.env) y configura la conexión a MongoDB
echo MONGODB_URI=mongodb://localhost:27017/propiedades > .env

# 4. Inicia el servidor con nodemon
npm run dev

Accede desde tu navegador a:
📍 http://localhost:3000

📁 Estructura del proyecto
├── bin/
│   └── www
├── routes/
├── views/
├── models/
├── public/
├── app.js
└── package.json


🧪 Futuras mejoras
Integración de pasarela de pagos

Validaciones avanzadas en formularios

Mejora visual con Tailwind CSS o Bootstrap

Despliegue en plataformas como Render o Railway

👨‍💻 Autor
Desarrollado por Omar Jaouad Benchouikh como parte de su Trabajo de Fin de Grado.
