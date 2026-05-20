const { sql } = require("../config/db");

// ==========================================
// 1. STATS GLOBALES
// ==========================================
exports.getGeneralStats = async (req, res) => {
    try {
        const stats = await sql`
            SELECT 
                COUNT(*)::int as total,
                COUNT(CASE WHEN estado_id = 1 THEN 1 END)::int as pendientes,
                COUNT(CASE WHEN estado_id = 2 THEN 1 END)::int as en_progreso,
                COUNT(CASE WHEN estado_id IN (4, 5) THEN 1 END)::int as completados
            FROM tickets
        `;
        
        const usersCount = await sql`SELECT COUNT(*)::int as total FROM users`;
        const commentsStats = await sql`SELECT COUNT(*)::int as total_comentarios FROM comments`;
        
        const mttrStats = await sql`
            SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (fecha_cierre - fecha_creacion)) / 3600)::numeric, 2), 0) AS mttr
            FROM tickets
            WHERE estado_id = 5 AND fecha_cierre IS NOT NULL
        `;

        const totalTickets = stats[0]?.total || 0;
        const totalComments = commentsStats[0]?.total_comentarios || 0;
        const avgCommentsPerTicket = totalTickets > 0 ? (totalComments / totalTickets).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: {
                totalTickets,
                pendingTickets: stats[0]?.pendientes || 0,
                inProgressTickets: stats[0]?.en_progreso || 0,
                completedTickets: stats[0]?.completados || 0,
                totalUsers: usersCount[0]?.total || 0,
                totalComments,
                avgCommentsPerTicket: parseFloat(avgCommentsPerTicket),
                mttr: parseFloat(mttrStats[0]?.mttr || 0) // Tiempo Promedio en horas
            }
        });
        
    } catch (error) {
        console.error('Error en stats generales:', error);
        res.status(500).json({ success: false, message: "Error obteniendo estadísticas" });
    }
};

// ==========================================
// 2. GRÁFICAS DEL DASHBOARD
// ==========================================
exports.getDashboardStats = async (req, res) => {
    try {
        // Todos ven el ritmo de la empresa en los últimos 7 días
        const diaQuery = await sql`
            SELECT DATE(fecha_creacion) as fecha, COUNT(*)::int as total
            FROM tickets
            WHERE fecha_creacion >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(fecha_creacion)
            ORDER BY fecha DESC
        `;
        
        const prioridadQuery = await sql`
            SELECT p.nombre, COUNT(t.id)::int as total
            FROM ticket_prioridades p
            LEFT JOIN tickets t ON t.prioridad_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY p.id
        `;
        
        const ticketsPorDia = diaQuery.map(item => ({
            fecha: item.fecha instanceof Date ? item.fecha.toISOString().split('T')[0] : item.fecha,
            total: item.total || 0
        }));
        
        const prioridadesStats = prioridadQuery.map(item => ({
            nombre: item.nombre,
            total: item.total || 0
        }));
        
        res.json({
            success: true,
            data: {
                ticketsPorDia,
                prioridadesStats,
                commentsPorDia: [], 
                topTicketsComentados: [] 
            }
        });
        
    } catch (error) {
        console.error('Error en dashboard stats:', error);
        res.status(500).json({ success: false, message: "Error obteniendo estadísticas del dashboard" });
    }
};
