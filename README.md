# 🎫 Versa Ticket - Sistema Corporativo de Soporte TI

![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20TailwindCSS-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?logo=postgresql&logoColor=white)

Versa Ticket es una plataforma integral de Help Desk y gestión de soporte técnico diseñada para entornos corporativos. Permite la creación, seguimiento y resolución de incidencias con un flujo de trabajo altamente optimizado por Inteligencia Artificial y herramientas de nivel empresarial.

## ✨ Características Principales

* **🤖 Auto-clasificación con IA (Gemini):** Análisis de sentimiento y clasificación automática de categoría, área y prioridad de tickets mediante la API de Google Gemini.
* **✍️ Firmas Digitales:** Captura y almacenamiento de firmas autógrafas directamente en el navegador mediante tecnología Canvas.
* **☁️ Almacenamiento en la Nube:** Gestión de archivos adjuntos y evidencias conectada directamente con Cloudinary.
* **📊 Dashboard Directivo:** Panel de control con métricas en tiempo real (MTTR, Tasa de Resolución, Eficiencia).
* **📄 Reportes Exportables:** Generación de reportes corporativos en PDF de alta calidad generados al vuelo.
* **🔒 Seguridad y Testing:** Roles de usuario escalonados (Admin, Agente, Usuario) y validación de calidad automatizada con Cypress.

## 🛠️ Stack Tecnológico

**Frontend:**
* React.js
* Tailwind CSS
* Lucide React (Iconografía)
* html2pdf.js (Generación de reportes)

**Backend:**
* Node.js & Express
* PostgreSQL (Serverless vía Neon)
* Multer & Cloudinary (Gestión de archivos)
* Google Generative AI SDK (Gemini 2.5 Flash)

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio
\`\`\`bash
git clone https://github.com/Maldionidas/versa-ticket.git
cd versa-ticket
\`\`\`

### 2. Configurar el Backend
Navega a la carpeta del backend, instala las dependencias y crea tu archivo de variables de entorno:
\`\`\`bash
cd versa-ticket-back
npm install
\`\`\`
Crea un archivo \`.env\` en el backend con las siguientes variables:
\`\`\`env
PORT=3000
DATABASE_URL=tu_url_de_postgresql_neon
CLOUDINARY_URL=tu_url_de_cloudinary
GEMINI_API_KEY=tu_llave_de_google_ai_studio
\`\`\`
Inicia el servidor:
\`\`\`bash
npm run dev
\`\`\`

### 3. Configurar el Frontend
Abre otra terminal, navega a la carpeta del frontend e inicia la aplicación:
\`\`\`bash
cd versa-ticket-front
npm install
npm run dev
\`\`\`

## 🏗️ Arquitectura y Diseño
El sistema utiliza un patrón arquitectónico MVC en el backend y una interfaz Master-Detail en el frontend, priorizando la responsividad y la experiencia de usuario bajo la "regla de los 5 segundos" para la toma de decisiones directivas.

---
*Desarrollado como proyecto de titulación en Ingeniería/Ciencias de la Computación.*