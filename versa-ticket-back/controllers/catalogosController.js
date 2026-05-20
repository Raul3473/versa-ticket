// controllers/catalogosController.js
const { sql } = require("../config/db");

// =========================
// AREAS
// =========================
exports.getAreas = async (req, res) => {
    try {

        const result = await sql`
        SELECT id, nombre, descripcion, activo
        FROM areas
        ORDER BY nombre`;

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo áreas" });
    }
};

// =========================
// PRIORIDADES
// =========================
exports.getPrioridades = async (req, res) => {
    try {

        const result = await sql`
        SELECT id, nombre, nivel
        FROM ticket_prioridades
        ORDER BY nivel`;

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo prioridades" });
    }
};

// =========================
// ESTADOS
// =========================
exports.getEstados = async (req, res) => {
    try {

        const result = await sql`
        SELECT id, nombre
        FROM ticket_estados
        WHERE activo = true`;

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo estados" });
    }
};

// =========================
// CATEGORIAS (todas)
// =========================
exports.getCategorias = async (req, res) => {
    try {

        const result = await sql`
        SELECT c.id, c.nombre, c.area_id, a.nombre AS area
        FROM ticket_categorias c
        JOIN areas a ON a.id = c.area_id
        WHERE c.activo = true
        ORDER BY c.nombre`;

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo categorías" });
    }
};

// =========================
// CATEGORIAS POR AREA
// =========================
exports.getCategoriasByArea = async (req, res) => {

    const { area_id } = req.params;

    try {

        const result = await sql`
        SELECT id, nombre
        FROM ticket_categorias
        WHERE area_id = ${area_id}
        AND activo = true
        ORDER BY nombre`;

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo categorías por área" });
    }
};

// =========================
// ROLES
// =========================
exports.getRoles = async (req, res) => {
    try {

        const result = await sql`
        SELECT id, nombre
        FROM roles
        ORDER BY nombre`;

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo roles" });
    }
};