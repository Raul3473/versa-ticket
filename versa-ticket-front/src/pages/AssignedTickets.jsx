// src/pages/AssignedTickets.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TicketComments from '../components/TicketComments';

const AssignedTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updating, setUpdating] = useState(false);

  // FILTROS
  const [filtroEstado, setFiltroEstado] =
    useState('todos');

  const [filtroFecha, setFiltroFecha] =
    useState('');

  // TABS
  const [activeTab, setActiveTab] =
    useState('details');

  useEffect(() => {
    cargarTicketsAsignados();
  }, []);

  const cargarTicketsAsignados = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3000/api/tickets/assigned', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const actualizarEstado = async (ticketId, nuevoEstadoId) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado_id: nuevoEstadoId })
      });

      if (response.ok) {
        alert(' Estado actualizado correctamente');
        cargarTicketsAsignados();
        setSelectedTicket(null);
      } else {
        alert(' Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString)
      return 'Fecha no disponible';

    const date = new Date(dateString);

    return date.toLocaleDateString(
      'es-ES',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const getPriorityColor = (prioridad) => {
    const prioridadLower = prioridad?.toLowerCase() || '';
    const colors = {
      crítica: 'text-red-600 bg-red-100',
      critica: 'text-red-600 bg-red-100',
      alta: 'text-orange-600 bg-orange-100',
      media: 'text-yellow-600 bg-yellow-100',
      baja: 'text-green-600 bg-green-100',
    };

    return (
      colors[prioridadLower] ||
      'text-gray-600 bg-gray-100'
    );
  };

  const getStatusColor = (estado) => {
    const estadoLower =
      estado?.toLowerCase() || '';

    const colors = {
      abierto: 'text-blue-600 bg-blue-100',
      'en proceso':
        'text-purple-600 bg-purple-100',
      'en espera':
        'text-orange-600 bg-orange-100',
      resuelto:
        'text-green-600 bg-green-100',
      cerrado: 'text-gray-600 bg-gray-100',
    };

    return (
      colors[estadoLower] ||
      'text-gray-600 bg-gray-100'
    );
  };

  const estadosTicket = [
    { id: 1, nombre: 'Abierto' },
    { id: 2, nombre: 'En proceso' },
    { id: 3, nombre: 'En espera' },
    { id: 4, nombre: 'Resuelto' },
    {id: 5, nombre: 'Cerrado' },
        ];

  // FILTRAR
  const ticketsFiltrados = useMemo(() => {
          let resultado = [...tickets];

        if (filtroEstado !== 'todos') {
          resultado = resultado.filter(
            (t) =>
              t.estado_nombre?.toLowerCase() ===
              filtroEstado
          );
    }

        if (filtroFecha) {
          resultado = resultado.filter((t) => {
            const fechaTicket = new Date(
              t.fecha_creacion
            )
              .toISOString()
              .split('T')[0];

            return fechaTicket === filtroFecha;
          });
    }

        return resultado;
  }, [
        tickets,
        filtroEstado,
        filtroFecha,
        ]);

        if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen overflow-hidden">

        {/* HEADER */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Tickets Asignados
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mb-6">
          Tickets asignados para resolver
        </p>

        {/* FILTROS */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-6">

          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={() =>
                setFiltroEstado('todos')
              }
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${filtroEstado === 'todos'
                ? 'bg-gray-900 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Todos
            </button>

            <button
              onClick={() =>
                setFiltroEstado('abierto')
              }
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${filtroEstado === 'abierto'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Abiertos
            </button>

            <button
              onClick={() =>
                setFiltroEstado('cerrado')
              }
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${filtroEstado === 'cerrado'
                ? 'bg-gray-700 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Cerrados
            </button>

            <div className="ml-auto">
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) =>
                  setFiltroFecha(
                    e.target.value
                  )
                }
                className="px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LISTA */}
          <div className="lg:col-span-1 space-y-3 max-h-[85vh] overflow-y-auto pr-2 custom-scroll">

            {ticketsFiltrados.length ===
              0 ? (
              <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                No hay tickets
              </div>
            ) : (
              ticketsFiltrados.map(
                (ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() =>
                      setSelectedTicket(
                        ticket
                      )
                    }
                    className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedTicket?.id ===
                      ticket.id
                      ? 'ring-2 ring-amber-500'
                      : ''
                      }`}
                  >

                    <div className="flex justify-between items-start gap-2 mb-2">

                      <h3 className="font-semibold text-gray-800 break-words line-clamp-2">
                        {ticket.titulo}
                      </h3>

                      <span
                        className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${getPriorityColor(
                          ticket.prioridad_nombre
                        )}`}
                      >
                        {ticket.prioridad_nombre ||
                          'Media'}
                      </span>

                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.descripcion}
                    </p>

                    <div className="flex flex-wrap justify-between items-center mt-3 gap-2">

                      <span className="text-xs text-gray-400">
                        {formatDate(
                          ticket.fecha_creacion
                        )}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          ticket.estado_nombre
                        )}`}
                      >
                        {ticket.estado_nombre}
                      </span>

                    </div>

                    <div className="mt-2 text-xs text-gray-400">
                      Usuario:{' '}
                      {ticket.usuario_nombre}
                    </div>

                  </div>
                )
              )
            )}

          </div>

          {/* DETALLE */}
          <div className="lg:col-span-2">

            {selectedTicket ? (

              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">

                {/* HEADER */}
                <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">

                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-4">

                    <div>

                      <h2 className="text-2xl font-bold text-gray-900 break-words leading-tight">
                        {selectedTicket.titulo}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 mt-3">

                        <span className="text-sm text-gray-400 font-medium">
                          #
                          {selectedTicket.id
                            ?.toString()
                            .padStart(6, '0')}
                        </span>

                        <span className="text-sm text-gray-400">
                          •
                        </span>

                        <span className="text-sm text-gray-500">
                          {formatDate(
                            selectedTicket.fecha_creacion
                          )}
                        </span>

                      </div>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <span
                        className={`text-xs px-4 py-1.5 rounded-full font-semibold shadow-sm ${getPriorityColor(
                          selectedTicket.prioridad_nombre
                        )}`}
                      >
                        {selectedTicket.prioridad_nombre}
                      </span>

                      <span
                        className={`text-xs px-4 py-1.5 rounded-full font-semibold shadow-sm ${getStatusColor(
                          selectedTicket.estado_nombre
                        )}`}
                      >
                        {selectedTicket.estado_nombre}
                      </span>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">

                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                      {selectedTicket.usuario_nombre
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <span>
                      Creado por{' '}
                      <span className="font-medium text-gray-700">
                        {
                          selectedTicket.usuario_nombre
                        }
                      </span>
                    </span>

                  </div>

                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-100 bg-white px-4 overflow-x-auto">

                  <button
                    onClick={() =>
                      setActiveTab(
                        'details'
                      )
                    }
                    className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab ===
                      'details'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500'
                      }`}
                  >
                    Detalles
                  </button>

                  <button
                    onClick={() =>
                      setActiveTab(
                        'comments'
                      )
                    }
                    className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab ===
                      'comments'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500'
                      }`}
                  >
                    Comentarios
                  </button>

                  <button
                    onClick={() =>
                      setActiveTab(
                        'activity'
                      )
                    }
                    className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab ===
                      'activity'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500'
                      }`}
                  >
                    Actividad
                  </button>

                </div>

                {/* DETALLES */}
                {activeTab ===
                  'details' && (
                    <div>

                      {/* DESCRIPCIÓN */}
                      <div className="p-5 sm:p-6 border-b border-gray-100">

                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Descripción
                        </h3>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">

                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                            {
                              selectedTicket.descripcion
                            }
                          </p>

                        </div>

                      </div>

                      {/* INFO */}
                      <div className="p-5 sm:p-6 border-b border-gray-100">

                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Información
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 shadow-sm">

                            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                              Área
                            </p>

                            <p className="text-sm font-semibold text-gray-800">
                              {
                                selectedTicket.area_nombre
                              }
                            </p>

                          </div>

                          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 shadow-sm">

                            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                              Categoría
                            </p>

                            <p className="text-sm font-semibold text-gray-800">
                              {
                                selectedTicket.categoria_nombre
                              }
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* ESTADOS */}
                      <div className="p-5 sm:p-6 border-b border-gray-100">

                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Actualizar Estado
                        </h3>

                        <div className="flex flex-wrap gap-3">

                          {estadosTicket.map(
                            (estado) => (
                              <button
                                key={
                                  estado.id
                                }
                                onClick={() =>
                                  actualizarEstado(
                                    selectedTicket.id,
                                    estado.id
                                  )
                                }
                                disabled={
                                  updating
                                }
                                className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${selectedTicket.estado_id ===
                                  estado.id
                                  ? 'bg-amber-500 text-white shadow-lg scale-105'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                              >
                                {
                                  estado.nombre
                                }
                              </button>
                            )
                          )}

                        </div>

                      </div>

                    </div>
                  )}

                {/* COMENTARIOS */}
                {activeTab ===
                  'comments' && (

                    <div className="bg-gray-50/50">

                      <TicketComments
                        ticketId={
                          selectedTicket.id
                        }
                        ticketEstadoId={
                          selectedTicket.estado_id
                        }
                        ticketEstadoNombre={
                          selectedTicket.estado_nombre
                        }
                      />

                    </div>

                  )}

                {/* ACTIVIDAD */}
                {activeTab ===
                  'activity' && (
                    <div className="p-6">

                      <div className="space-y-5">

                        <div className="flex gap-4">

                          <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>

                          <div>
                            <p className="font-medium text-gray-800">
                              Ticket creado
                            </p>

                            <p className="text-sm text-gray-500">
                              {formatDate(
                                selectedTicket.fecha_creacion
                              )}
                            </p>
                          </div>

                        </div>

                        <div className="flex gap-4">

                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>

                          <div>
                            <p className="font-medium text-gray-800">
                              Estado actual
                            </p>

                            <p className="text-sm text-gray-500">
                              {
                                selectedTicket.estado_nombre
                              }
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                {/* FOOTER */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">

                  <p className="text-xs text-gray-400 text-center">
                    Sistema de Tickets • Versa
                    Ticket
                  </p>

                </div>

              </div>

            ) : (

              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 text-center text-gray-500 h-full flex flex-col justify-center items-center min-h-[500px]">

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Ningún ticket seleccionado
                </h3>

                <p className="text-gray-500 max-w-md leading-relaxed">
                  Selecciona un ticket de
                  la lista izquierda para
                  ver toda la información.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>
      );
};

      export default AssignedTickets;