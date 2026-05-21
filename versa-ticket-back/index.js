const express = require("express");
const cors = require("cors");
const path = require("path");
const transporter = require("./config/mailer");
require("dotenv").config();

// ==========================================
// IMPORTACIÓN DE RUTAS
// ==========================================
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const ticketsRoutes = require("./routes/ticketsRoutes");
const catalogosRoutes = require("./routes/catalogosRoutes"); 
const areasRoutes = require("./routes/areasRoutes");
const rolesRoutes = require("./routes/rolesRouter"); 
const categoriasRoutes = require("./routes/categoriasRoutes");
const camposRoutes = require("./routes/camposRoutes");
const statsRoutes = require("./routes/statsRoutes");
const estadosRoutes = require("./routes/estadosRoutes");
const prioridadesRoutes = require("./routes/prioridadesRoutes");
const commentsRoutes = require("./routes/commentsRoutes");

const app = express();

// ==========================================
// MIDDLEWARES GLOBALES
// ==========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Registro de peticiones en consola para facilitar el debug
app.use((req, res, next) => {
    console.log(`\n ${req.method} ${req.url}`);
    next();
});

// ==========================================
// ENDPOINTS DE LA API
// ==========================================

// Ruta base de prueba
app.get("/", (req, res) => {
    res.json({ message: "API Versa Ticket funcionando" });
});

// 1. Autenticación (Pública)
app.use("/api/auth", authRoutes);

// 2. Módulos de Administración y Operación (Protegidos internamente)
app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/areas", areasRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/campos", camposRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/catalogos", catalogosRoutes); 

// 3. Módulos de Soporte y Estadísticas
app.use("/api/stats", statsRoutes);
app.use("/api/estados", estadosRoutes);
app.use("/api/prioridades", prioridadesRoutes);

// ==========================================
// MANEJO DE ERRORES Y SERVIDOR
// ==========================================

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n Servidor corriendo en puerto ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(" Estado: Operativo y blindado");
});