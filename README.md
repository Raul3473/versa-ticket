# Versa Ticket - Sistema de Gestión de Soporte Técnico

##  Descripción
Plataforma integral para la gestión de tickets de soporte, permitiendo la comunicación fluida entre usuarios, agentes y administradores. Incluye gestión de evidencias, firmas digitales y notificaciones automáticas.

##  Stack
- **Frontend:** React.js, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express.
- **Base de Datos:** PostgreSQL (u Oracle Cloud Infrastructure).
- **Servicios Externos:** Cloudinary (Imágenes), Nodemailer (Correos).

##  Instalación y Configuración

### Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL corriendo localmente o en la nube.

### Configuración del Entorno
Crea un archivo `.env` en la raíz del servidor con las siguientes variables:
```env
PORT=3000
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_NAME=versa_ticket
CLOUDINARY_URL=tu_url_de_cloudinary
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
JWT_SECRET=tu_clave_secreta