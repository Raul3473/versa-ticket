const { sql, pool } = require("../config/db");
const fs = require('fs');
const path = require('path');
const { cloudinary } = require("../config/cloudinary");
const transporter = require("../config/mailer");
const { enviarCorreoTicketCerrado } = require("../services/notificationService");

// ==========================================
// 1. OBTENER TODOS LOS TICKETS (Con filtros por rol)
// ==========================================
exports.getTickets = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol_id;

        let result;
        if (userRole === 2 || userRole === "Administrador") {
            result = await sql`
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre,
               r.nombre as responsable_nombre,
               COALESCE(
                json_agg(at.*) FILTER (WHERE at.id IS NOT NULL), 
                '[]'
                ) AS attachments
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        LEFT JOIN users r ON t.responsable_id = r.id
        LEFT JOIN attachments at ON t.id = at.ticket_id
        GROUP BY t.id, p.nombre, c.nombre, a.nombre, e.nombre, u.nombre, r.nombre
        ORDER BY t.id DESC
      `;
        } else {
            // Si es un Usuario Normal, SOLO ve los suyos
            result = await sql`
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre,
               r.nombre as responsable_nombre,
                COALESCE(
                json_agg(at.*) FILTER (WHERE at.id IS NOT NULL), 
                '[]'
                ) AS attachments
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        LEFT JOIN users r ON t.responsable_id = r.id
        LEFT JOIN attachments at ON t.id = at.ticket_id
        WHERE t.usuario_id = ${userId}
        GROUP BY t.id, p.nombre, c.nombre, a.nombre, e.nombre, u.nombre, r.nombre
        ORDER BY t.id DESC
      `;
        }

        res.json(result);
    } catch (error) {
        console.error('Error obteniendo tickets:', error);
        res.status(500).json({ message: "Error obteniendo tickets" });
    }
};

// ==========================================
// 2. OBTENER TICKETS ASIGNADOS AL AGENTE
// ==========================================
exports.getAssignedTickets = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.rol_id;

        let result;
        if (userRole === 2 || userRole === "Administrador") {
            // Admin ve todos los tickets con alguien asignado
            result = await sql`
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre,
               r.nombre as responsable_nombre,
               COALESCE(
                json_agg(at.*) FILTER (WHERE at.id IS NOT NULL), 
                '[]'
                ) AS attachments
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        LEFT JOIN users r ON t.responsable_id = r.id
        LEFT JOIN attachments at ON t.id = at.ticket_id
        WHERE t.responsable_id IS NOT NULL
        GROUP BY t.id, p.nombre, c.nombre, a.nombre, e.nombre, u.nombre, r.nombre
        ORDER BY t.id DESC
      `;
        } else {
            // Agente ve solo los tickets que le asignaron a él
            result = await sql`
        SELECT t.*, 
               p.nombre as prioridad_nombre,
               c.nombre as categoria_nombre,
               a.nombre as area_nombre,
               e.nombre as estado_nombre,
               u.nombre as usuario_nombre,
               r.nombre as responsable_nombre,
               COALESCE(
                json_agg(at.*) FILTER (WHERE at.id IS NOT NULL), 
                '[]'
                ) AS attachments
        FROM tickets t
        LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
        LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
        LEFT JOIN areas a ON t.area_id = a.id
        LEFT JOIN ticket_estados e ON t.estado_id = e.id
        LEFT JOIN users u ON t.usuario_id = u.id
        LEFT JOIN users r ON t.responsable_id = r.id
        LEFT JOIN attachments at ON t.id = at.ticket_id
        WHERE t.responsable_id = ${userId}
        GROUP BY t.id, p.nombre, c.nombre, a.nombre, e.nombre, u.nombre, r.nombre
        ORDER BY t.id DESC
      `;
        }

        res.json(result);
    } catch (error) {
        console.error('Error en getAssignedTickets:', error);
        res.status(500).json({ message: "Error obteniendo tickets asignados", error: error.message });
    }
};

// ==========================================
// 3. OBTENER TICKET POR ID
// ==========================================
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const result = await sql`
      SELECT t.*, 
             p.nombre as prioridad_nombre,
             c.nombre as categoria_nombre,
             a.nombre as area_nombre,
             e.nombre as estado_nombre,
             u.nombre as usuario_nombre,
             r.nombre as responsable_nombre,
             COALESCE(
                json_agg(at.*) FILTER (WHERE at.id IS NOT NULL), 
                '[]'
                ) AS attachments
      FROM tickets t
      LEFT JOIN ticket_prioridades p ON t.prioridad_id = p.id
      LEFT JOIN ticket_categorias c ON t.categoria_id = c.id
      LEFT JOIN areas a ON t.area_id = a.id
      LEFT JOIN ticket_estados e ON t.estado_id = e.id
      LEFT JOIN users u ON t.usuario_id = u.id
      LEFT JOIN users r ON t.responsable_id = r.id
      LEFT JOIN attachments at ON t.id = at.ticket_id
      WHERE t.id = ${id}
      GROUP BY t.id, p.nombre, c.nombre, a.nombre, e.nombre, u.nombre, r.nombre
    `;

        if (result.length === 0) {
            return res.status(404).json({ message: "Ticket no encontrado" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo ticket" });
    }
};

// ==========================================
// 4. CREAR TICKET 
// ==========================================
exports.createTicket = async (req, res) => {
    let { titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, valores_dinamicos } = req.body;
    const archivos = req.files;
    const usuario_id = req.user?.id;

    if (!usuario_id) {
        return res.status(401).json({ message: "No autorizado. Token inválido o expirado." });
    }

    if (!titulo || !descripcion || !prioridad_id || !area_id) {
        return res.status(400).json({ message: "Campos obligatorios faltantes" });
    }

    const cat_id = categoria_id && categoria_id !== "null" && categoria_id !== "undefined" && categoria_id !== "" ? categoria_id : null;
    const resp_id = responsable_id && responsable_id !== "null" && responsable_id !== "undefined" && responsable_id !== "" ? responsable_id : null;
    const estado_id = 1;

    // Solicitamos un cliente exclusivo del Pool
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtenemos el tiempo SLA directo de tu tabla dinámica
        const prioridadResult = await client.query(
            `SELECT tiempo_sla FROM ticket_prioridades WHERE id = $1`,
            [prioridad_id]
        );
        const horasSLA = prioridadResult.rows[0]?.tiempo_sla || 24;

        // Calculamos la fecha
        const slaFechaLimite = new Date();
        slaFechaLimite.setHours(slaFechaLimite.getHours() + horasSLA);

        // 2. Insertar Ticket (¡Sin Folio! El Trigger de Postgres lo hará)
        const ticketQuery = `
            INSERT INTO tickets 
            (titulo, descripcion, estado_id, prioridad_id, categoria_id, usuario_id, responsable_id, area_id, sla_fecha_limite) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING id, folio;
        `;
        const ticketResult = await client.query(ticketQuery, [
            titulo, descripcion, estado_id, prioridad_id, cat_id, usuario_id, resp_id, area_id, slaFechaLimite.toISOString()
        ]);

        const nuevoTicketId = ticketResult.rows[0].id;
        const folioGenerado = ticketResult.rows[0].folio;

        // 3. Insertar Campos Dinámicos
        if (valores_dinamicos) {
            let valoresParseados = valores_dinamicos;
            if (typeof valores_dinamicos === 'string') {
                valoresParseados = JSON.parse(valores_dinamicos);
            }

            for (const campo_id of Object.keys(valoresParseados)) {
                const valor = valoresParseados[campo_id];
                if (valor !== "" && valor !== null && valor !== false) {
                    await client.query(
                        `INSERT INTO ticket_campos_valores (ticket_id, campo_id, valor) VALUES ($1, $2, $3)`,
                        [nuevoTicketId, campo_id, valor.toString()]
                    );
                }
            }
        }

        // 4. Insertar Evidencias (Lógica de Cloudinary)
        if (archivos && archivos.length > 0) {
            for (const file of archivos) {
                const rutaWeb = file.path;
                if (!rutaWeb) {
                    console.log("¡Cloudinary no devolvió la ruta para el archivo:", file.originalname);
                }
                await client.query(
                    `INSERT INTO attachments (ticket_id, nombre_archivo, ruta_archivo, tipo_archivo, tamaño, subido_por) VALUES ($1, $2, $3, $4, $5, $6)`,
                    [nuevoTicketId, file.originalname, rutaWeb, file.mimetype, file.size || 0, usuario_id]
                );
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: "Ticket creado exitosamente",
            ticketId: nuevoTicketId,
            folio: folioGenerado
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en la transacción de creación de ticket:", error);
        res.status(500).json({ message: "Error creando ticket", error: error.message });
    } finally {
        client.release();
    }
};

// ==========================================
// 5. ACTUALIZAR TICKET (Con notificaciones)
// ==========================================
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            titulo, descripcion, prioridad_id, categoria_id, area_id, responsable_id, estado_id
        } = req.body;

        const ESTADO_CERRADO_ID = 5;

        // 1. Obtener estado actual antes de actualizar
        const ticketAntes = await sql`
            SELECT estado_id, usuario_id
            FROM tickets
            WHERE id = ${id}
        `;

        if (ticketAntes.length === 0) {
            return res.status(404).json({ message: "Ticket no encontrado" });
        }

        const estadoAnterior = ticketAntes[0].estado_id;

        // 2. Actualizar ticket
        const result = await sql`
            UPDATE tickets 
            SET titulo = COALESCE(${titulo || null}, titulo),
                descripcion = COALESCE(${descripcion || null}, descripcion),
                prioridad_id = COALESCE(${prioridad_id || null}, prioridad_id),
                categoria_id = COALESCE(${categoria_id || null}, categoria_id),
                area_id = COALESCE(${area_id || null}, area_id),
                responsable_id = COALESCE(${responsable_id || null}, responsable_id),
                estado_id = COALESCE(${estado_id || null}, estado_id)
            WHERE id = ${id}
            RETURNING *
        `;

        const ticketActualizado = result[0];

        // 3. Validar cambio REAL a cerrado para notificar
        const cambioACerrado =
            Number(estadoAnterior) !== ESTADO_CERRADO_ID &&
            Number(ticketActualizado.estado_id) === ESTADO_CERRADO_ID;

        if (cambioACerrado) {
            try {
                const userResult = await sql`SELECT nombre, email FROM users WHERE id = ${ticketActualizado.usuario_id}`;
                if (userResult.length > 0) {
                    const usuario = userResult[0];
                    await enviarCorreoTicketCerrado(usuario, ticketActualizado, transporter);
                }
            } catch (error) {
                console.error("❌ Error enviando email de cierre:", error);
            }
        }

        res.json(ticketActualizado);

    } catch (error) {
        console.error("❌ Error actualizando ticket:", error);
        res.status(500).json({ message: "Error actualizando ticket" });
    }
};

// ==========================================
// 6. ELIMINAR TICKET
// ==========================================
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql`DELETE FROM tickets WHERE id = ${id} RETURNING id`;

        if (result.length === 0) {
            return res.status(404).json({ message: "Ticket no encontrado" });
        }

        res.json({ message: "Ticket eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error eliminando ticket" });
    }
};

// ==========================================
// 7. Firmar ticket (Evidencias y Firmas)
// ==========================================
exports.closeTicketSign = async (req, res) => {
    try {
        const { id } = req.params;
        const { firma_base64 } = req.body;

        if (!firma_base64) {
            return res.status(400).json({ message: "La firma es obligatoria para cerrar el ticket." });
        }
        
        // Subir base64 a Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(firma_base64, {
            folder: "ticket_firmas",
            public_id: `firma_tkt_${id}_${Date.now()}`
        });
        
        const rutaWeb = uploadResponse.secure_url;

        // Actualizamos el estado y guardamos la ruta
        const result = await sql`
            UPDATE tickets 
            SET estado_id = 5, 
                firma_representante = ${rutaWeb},
                fecha_cierre = CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City'
            WHERE id = ${id}
            RETURNING *
        `;

        res.json({
            message: "Ticket cerrado y firmado exitosamente",
            ticket: result[0]
        });

    } catch (error) {
        console.error("Error CRÍTICO al guardar la firma:", error);
        res.status(500).json({ message: "Error interno al procesar la firma" });
    }
};