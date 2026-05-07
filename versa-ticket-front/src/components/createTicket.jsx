// src/components/createTicket.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  const [prioridades, setPrioridades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [agentes, setAgentes] = useState([]); // ✅ Agregado: lista de agentes
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad_id: '',
    categoria_id: '',
    area_id: '',
    responsable_id: '' // ✅ Agregado: ID del agente asignado
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargandoDatos(true);
      
      // Cargar prioridades
      const resPrioridades = await fetch('http://localhost:3000/api/prioridades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resPrioridades.ok) {
        const data = await resPrioridades.json();
        setPrioridades(Array.isArray(data) ? data : []);
      } else {
        setPrioridades([
          { id: 1, nombre: 'Baja' },
          { id: 2, nombre: 'Media' },
          { id: 3, nombre: 'Alta' },
          { id: 4, nombre: 'Crítica' }
        ]);
      }

      // Cargar categorías
      const resCategorias = await fetch('http://localhost:3000/api/categorias', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resCategorias.ok) {
        const data = await resCategorias.json();
        setCategorias(Array.isArray(data) ? data : []);
      } else {
        setCategorias([
          { id: 1, nombre: 'Hardware' },
          { id: 2, nombre: 'Software' },
          { id: 3, nombre: 'Redes' },
          { id: 4, nombre: 'Acceso' }
        ]);
      }

      // Cargar áreas
      const resAreas = await fetch('http://localhost:3000/api/areas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resAreas.ok) {
        const data = await resAreas.json();
        setAreas(Array.isArray(data) ? data : []);
      } else {
        setAreas([
          { id: 1, nombre: 'Sistemas' },
          { id: 2, nombre: 'Soporte' },
          { id: 3, nombre: 'Ventas' },
          { id: 4, nombre: 'Recursos Humanos' }
        ]);
      }

      // ✅ Cargar agentes (rol_id = 3)
      await cargarAgentes();
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargandoDatos(false);
    }
  };

  // ✅ Función para cargar agentes
  const cargarAgentes = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/users?rol=3', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAgentes(Array.isArray(data) ? data : []);
      } else {
        // Si no hay endpoint con filtro, cargar todos y filtrar
        const resAll = await fetch('http://localhost:3000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resAll.ok) {
          const allUsers = await resAll.json();
          const agentesFiltrados = allUsers.filter(u => u.rol_id === 3);
          setAgentes(agentesFiltrados);
        }
      }
    } catch (error) {
      console.error('Error cargando agentes:', error);
      setAgentes([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      
      const ticketData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad_id: parseInt(formData.prioridad_id),
        categoria_id: parseInt(formData.categoria_id),
        area_id: parseInt(formData.area_id),
        usuario_id: usuario?.id,
        responsable_id: formData.responsable_id ? parseInt(formData.responsable_id) : null,
        estado_id: 1 // Pendiente
      };

      const response = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData)
      });

      if (response.ok) {
        alert('✅ Ticket creado exitosamente');
        navigate('/inbox');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear ticket');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadColor = (id) => {
    const colores = { 1: 'green', 2: 'yellow', 3: 'orange', 4: 'red' };
    return colores[id] || 'gray';
  };

  if (cargandoDatos) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">✨ Crear Nuevo Ticket</h1>
          <p className="text-gray-500 mt-1">Completa el formulario para reportar un problema</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tarjeta principal */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <h2 className="text-white font-semibold text-lg">Información del Ticket</h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Título */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  📝 Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: No funciona la impresora"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  📄 Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe detalladamente el problema..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                  required
                />
              </div>

              {/* Grid de 4 columnas en desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Prioridad */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ⚡ Prioridad <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="prioridad_id"
                    value={formData.prioridad_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {prioridades.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    🏷️ Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Área */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    🏢 Área <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="area_id"
                    value={formData.area_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Seleccionar</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ Agente Responsable (Nuevo) */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    👨‍💼 Asignar a Agente
                  </label>
                  <select
                    name="responsable_id"
                    value={formData.responsable_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Sin asignar</option>
                    {agentes.map((agente) => (
                      <option key={agente.id} value={agente.id}>
                        {agente.nombre} {agente.apellido || ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Opcional: asigna un agente responsable
                  </p>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/inbox')}
                className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:brightness-105 transition shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </span>
                ) : (
                  'Crear Ticket'
                )}
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium">Información importante</p>
                <p className="text-xs text-blue-600 mt-1">
                  Todos los tickets serán revisados por el equipo de soporte. 
                  Proporciona la mayor cantidad de detalles posible para una resolución más rápida.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;