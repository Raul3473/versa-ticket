// src/components/TicketModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // ✅ Importar la instancia configurada

export default function TicketModal({ onClose, onTicketCreated, currentUser }) {
  const [areas, setAreas] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad_id: '',
    categoria_id: '',
    area_id: '',
  });

  // Cargar catálogos
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        setLoading(true);
        // ✅ Usar api en lugar de fetch
        const [areasRes, prioridadesRes] = await Promise.all([
          api.get('/catalogos/areas'),
          api.get('/catalogos/prioridades')
        ]);

        setAreas(areasRes.data);
        setPrioridades(prioridadesRes.data);
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        if (error.response?.status === 401) {
          console.warn('No autenticado - redirigiendo a login');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogos();
  }, []);

  // Cargar categorías cuando cambia el área
  useEffect(() => {
    if (!formData.area_id) {
      setCategorias([]);
      return;
    }

    const fetchCategorias = async () => {
      try {
        const response = await api.get(`/catalogos/categorias/${formData.area_id}`);
        setCategorias(response.data);
      } catch (error) {
        console.error('Error cargando categorías:', error);
        setCategorias([]);
      }
    };

    fetchCategorias();
  }, [formData.area_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'area_id' && { categoria_id: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo.trim()) {
      alert('El título es requerido');
      return;
    }
    if (!formData.descripcion.trim()) {
      alert('La descripción es requerida');
      return;
    }
    if (!formData.area_id) {
      alert('Selecciona un área');
      return;
    }
    if (!formData.categoria_id) {
      alert('Selecciona una categoría');
      return;
    }
    if (!formData.prioridad_id) {
      alert('Selecciona una prioridad');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/tickets', {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad_id: parseInt(formData.prioridad_id),
        categoria_id: parseInt(formData.categoria_id),
        area_id: parseInt(formData.area_id),
        estado_id: 1, // Pendiente
        usuario_id: currentUser?.id,
      });

      console.log('✅ Ticket creado:', response.data);
      
      // Notificar al componente padre
      if (onTicketCreated) {
        onTicketCreated(response.data);
      }
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('❌ Error creando ticket:', error);
      
      if (error.response) {
        // El servidor respondió con un error
        const mensaje = error.response.data?.message || 'Error al crear el ticket';
        alert(mensaje);
        
        if (error.response.status === 401) {
          window.location.href = '/login';
        }
      } else if (error.request) {
        // No se recibió respuesta
        alert('Error de conexión con el servidor');
      } else {
        alert('Error inesperado al crear el ticket');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Crear Nuevo Ticket</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Ej: Problema con la impresora"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Describe el problema detalladamente..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área *
              </label>
              <select
                name="area_id"
                value={formData.area_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Selecciona un área</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.nombre}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                required
                disabled={!formData.area_id}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.area_id ? 'Primero selecciona un área' : 'Selecciona una categoría'}
                </option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad *
              </label>
              <select
                name="prioridad_id"
                value={formData.prioridad_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Selecciona una prioridad</option>
                {prioridades.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 text-white rounded-lg px-4 py-2 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          </form>
        </div>
      </div>
    </div>
  );
}