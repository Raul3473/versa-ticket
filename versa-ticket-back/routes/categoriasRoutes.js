const express = require("express");
const router = express.Router();
const categoriasController = require("../controllers/categoriasController");
const { verifyToken, hasPermission } = require("../middlewares/authMiddleware");

// 🛡️ CAPA 1: Protegemos todas las rutas exigiendo que el usuario tenga sesión (Token válido)
router.use(verifyToken);

// ======================================================================
// RUTAS ABIERTAS
// ======================================================================


router.get("/activas", categoriasController.getCategorias);

// ======================================================================
// RUTAS PARA EL PANEL DE ADMINISTRACIÓN (Requieren permisos de 'categorias')
// ======================================================================

// Tu ruta original del admin panel
router.get("/", hasPermission("categorias", "read"), categoriasController.getAllCategoriasAdmin);

// Rutas de escritura protegidas con RBAC
router.post("/", hasPermission("categorias", "create"), categoriasController.createCategoria);

// ======================================================================
// RUTAS CON PARÁMETROS DINÁMICOS (Siempre van al final para evitar choques)
// ======================================================================

router.get("/:id", categoriasController.getCategoriaById);

router.put("/:id", hasPermission("categorias", "update"), categoriasController.updateCategoria);
router.delete("/:id", hasPermission("categorias", "delete"), categoriasController.deleteCategoria);

module.exports = router;