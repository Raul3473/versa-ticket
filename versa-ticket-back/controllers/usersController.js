const { sql}  = require("../config/db");
const bcrypt = require("bcryptjs");

// ==========================================
// 1. OBTENER TODOS LOS USUARIOS
// ==========================================
exports.getUsers = async (req, res) => {
  try {
    const { rol } = req.query;
    const userRole = req.user?.rol_id;
    
    let result;
    
    // Si es Administrador (Rol 2), ve a todos los usuarios
    if (userRole === 2) {
      if (rol) {
        result = await sql`
            SELECT u.id, u.nombre, u.apellido, u.email, u.rol_id, u.area_id, 
                   r.nombre AS rol_nombre, a.nombre AS area_nombre, u.activo, u.fecha_registro
            FROM users u
            LEFT JOIN roles r ON u.rol_id = r.id
            LEFT JOIN areas a ON u.area_id = a.id
            WHERE u.rol_id = ${rol}
            ORDER BY u.id
        `;
      } else {
        result = await sql`
            SELECT u.id, u.nombre, u.apellido, u.email, u.rol_id, u.area_id, 
                   r.nombre AS rol_nombre, a.nombre AS area_nombre, u.activo, u.fecha_registro
            FROM users u
            LEFT JOIN roles r ON u.rol_id = r.id
            LEFT JOIN areas a ON u.area_id = a.id
            ORDER BY u.id
        `;
      }
    } else {
      // Si no es admin, solo ve usuarios activos que no sean administradores
      result = await sql`
          SELECT u.id, u.nombre, u.apellido, u.email, u.rol_id, u.area_id, 
                 r.nombre AS rol_nombre, a.nombre AS area_nombre, u.activo, u.fecha_registro
          FROM users u
          LEFT JOIN roles r ON u.rol_id = r.id
          LEFT JOIN areas a ON u.area_id = a.id
          WHERE u.activo = true AND u.rol_id != 2
          ORDER BY u.id
      `;
    }

    res.json(result);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};

// ==========================================
// 2. OBTENER USUARIO POR ID
// ==========================================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.rol_id;
    
    // Si no es admin, solo puede ver su propio perfil
    if (userRole !== 2 && parseInt(id) !== req.user?.id) {
      return res.status(403).json({ message: "No tienes permiso para ver este usuario" });
    }
    
    const result = await sql`
      SELECT u.id, u.nombre, u.apellido, u.email, u.rol_id, u.area_id, 
             r.nombre AS rol_nombre, a.nombre AS area_nombre, u.activo, u.fecha_registro
      FROM users u
      LEFT JOIN roles r ON u.rol_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.id = ${id}
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
};

// ==========================================
// 3. CREAR USUARIO
// ==========================================
exports.createUser = async (req, res) => {
  try {
    let { nombre, apellido, email, password, rol_id, area_id } = req.body;
    const values = [nombre, apellido, email, rol_id];
    const userRole = req.user?.rol_id;
    area_id = area_id === "" ? null : area_id;
    // Solo administradores pueden crear usuarios
    if (userRole !== 2) {
      return res.status(403).json({ message: "No tienes permiso para crear usuarios" });
    }
    
    // Contraseña por defecto si no se envía una
    const plainPassword = password || "123456";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const result = await sql`
      INSERT INTO users (nombre, apellido, email, password_hash, rol_id, area_id, activo)
      VALUES (${nombre}, ${apellido}, ${email}, ${hashedPassword}, ${rol_id}, ${area_id}, true)
      RETURNING id, nombre, apellido, email, rol_id, area_id, activo
    `;
    
    res.status(201).json(result[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    console.error('Error creando usuario:', error);
    res.status(500).json({ message: "Error creando usuario" });
  }
};

// ==========================================
// 4. ACTUALIZAR USUARIO
// ==========================================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, rol_id, area_id, activo } = req.body;
    const userRole = req.user?.rol_id;
    const currentUserId = req.user?.id;
    
    // Verificar permisos
    if (userRole !== 2 && parseInt(id) !== currentUserId) {
      return res.status(403).json({ message: "No tienes permiso para modificar este usuario" });
    }
    
    let result;

    // Solo el admin puede cambiar el rol y el estado activo
    if (userRole === 2) {
      result = await sql`
        UPDATE users 
        SET nombre = COALESCE(${nombre || null}, nombre),
            apellido = COALESCE(${apellido || null}, apellido),
            area_id = COALESCE(${area_id || null}, area_id),
            rol_id = COALESCE(${rol_id || null}, rol_id),
            activo = COALESCE(${activo}, activo)
        WHERE id = ${id}
        RETURNING id, nombre, apellido, email, rol_id, area_id, activo
      `;
    } else {
      // Un usuario normal solo puede actualizar sus datos básicos
      result = await sql`
        UPDATE users 
        SET nombre = COALESCE(${nombre || null}, nombre),
            apellido = COALESCE(${apellido || null}, apellido),
            area_id = COALESCE(${area_id || null}, area_id)
        WHERE id = ${id}
        RETURNING id, nombre, apellido, email, rol_id, area_id, activo
      `;
    }
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: "Error actualizando usuario" });
  }
};

// ==========================================
// 5. ELIMINAR USUARIO
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.rol_id;
    
    // Solo administrador
    if (userRole !== 2) {
      return res.status(403).json({ message: "No tienes permiso para eliminar usuarios" });
    }
    
    // No permitir eliminar a sí mismo
    if (parseInt(id) === req.user?.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propio usuario" });
    }
    
    const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ 
          message: "No se puede eliminar el usuario porque tiene tickets asignados o creados. Desactívalo en su lugar." 
      });
    }
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};