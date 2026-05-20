const express = require("express");
const router = express.Router();

const path = require("path");

//para cloudinary
const { storage } = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ storage: storage,limits: { fileSize: 10 * 1024 * 1024 } });

//import de controller
const ticketsController = require("../controllers/ticketsController");

// Middlewares de Autenticación y Permisos (De tu rama principal)
const { verifyToken, hasPermission } = require("../middlewares/authMiddleware");

// Middlewares de Reglas de Negocio (De la rama de Comentarios)
const { checkTicketNotClosed, checkTicketIsClosed } = require("../middlewares/ticketStatus");

// ruta para análisis automático con IA
router.post('/analyze', ticketsController.autoClassify);
// ruta para cerrar con firma y subir a cloudinary
router.put('/:id/firmar', verifyToken, ticketsController.closeTicketSign);

// 2. EL CANDADO PRINCIPAL
// Exige que el usuario tenga un token válido para acceder a cualquier ruta
router.use(verifyToken);

// 3. RUTAS DE LECTURA 
router.get("/assigned", ticketsController.getAssignedTickets);
router.get("/", ticketsController.getTickets);
router.get("/:id", ticketsController.getTicketById);


// 4. CREACIÓN DE TICKETS (Con soporte para archivos)
router.post("/", upload.array("archivos", 5), ticketsController.createTicket); 


// 5. ACTUALIZACIÓN DE TICKETS
// Cadena de seguridad: Token Válido -> ¿Tiene Permiso de Update? -> ¿El ticket NO está cerrado? -> Controlador
router.put(
  "/:id", 
  hasPermission("tickets", "update"), 
  checkTicketNotClosed, 
  ticketsController.updateTicket
);

// 6. ELIMINACIÓN DE TICKETS
// Cadena de seguridad: Token Válido -> ¿Tiene Permiso de Delete? -> ¿El ticket SÍ está cerrado? -> Controlador
router.delete(
  "/:id", 
  hasPermission("tickets", "delete"), 
  checkTicketIsClosed, 
  ticketsController.deleteTicket
);

module.exports = router;