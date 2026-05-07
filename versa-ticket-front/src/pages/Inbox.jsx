// src/pages/Inbox.jsx
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TicketComments from '../components/TicketComments';
import SignatureModal from '../components/modalFirmas';
import { ArrowLeft, UploadCloud, X, Paperclip } from 'lucide-react'

// 1. FUNCIONES Y CONSTANTES ESTÁTICAS
const estadosTicket = [
  { id: 1, nombre: 'Abierto' },
  { id: 2, nombre: 'En proceso' },
  { id: 3, nombre: 'En espera' },
  { id: 4, nombre: 'Resuelto' },
  { id: 5, nombre: 'Cerrado' }
];

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  // AJUSTE MANUAL MÉXICO
  date.setHours(date.getHours() - 6);

  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const getPriorityColor = (prioridad) => {
  const prioridadLower = prioridad?.toLowerCase() || '';
  const colors = {
    'critica': 'text-red-600 bg-red-100',
    'alta': 'text-orange-600 bg-orange-100',
    'media': 'text-yellow-600 bg-yellow-100',
    'baja': 'text-green-600 bg-green-100'
  };

  return colors[prioridadLower] || 'text-gray-600 bg-gray-100';
};

const getStatusColor = (estado) => {
  const estadoLower = estado?.toLowerCase() || '';
  const colors = {
    'abierto': 'text-blue-600 bg-blue-100',
    'pendiente': 'text-blue-600 bg-blue-100',
    'en proceso': 'text-purple-600 bg-purple-100',
    'en_progreso': 'text-purple-600 bg-purple-100',
    'en espera': 'text-orange-600 bg-orange-100',
    'resuelto': 'text-green-600 bg-green-100',
    'completado': 'text-green-600 bg-green-100',
    'cerrado': 'text-gray-600 bg-gray-100'
  };
  return colors[estadoLower] || 'text-gray-600 bg-gray-100';
};

// Calculadora de SLA
const calcularEstadoSLA = (fechaLimite, estadoId) => {
  // IDs 4 (Resuelto) y 5 (Cerrado) detienen el reloj
  if (!fechaLimite || estadoId === 4 || estadoId === 5) {
    return { estado: 'inactivo', claseFila: 'bg-white border-gray-200', badge: 'bg-gray-100 text-gray-600', texto: 'Inactivo' };
  }

  const ahora = new Date();
  const limite = new Date(fechaLimite);
  const diferenciaHoras = (limite - ahora) / (1000 * 60 * 60);

  if (diferenciaHoras < 0) {
    return { estado: 'vencido', claseFila: 'bg-red-50 border-red-300', badge: 'bg-red-200 text-red-800 font-bold', texto: '¡Vencido!' };
  }

  if (diferenciaHoras <= 2) {
    return { estado: 'peligro', claseFila: 'bg-orange-50 border-orange-300', badge: 'bg-orange-200 text-orange-800 font-bold', texto: 'Por vencer' };
  }

  return { estado: 'a_tiempo', claseFila: 'bg-white border-gray-200', badge: 'bg-green-100 text-green-800', texto: 'A tiempo' };
};

// 2. COMPONENTE PRINCIPAL
const Inbox = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const detailRef = useRef(null);
  const isAdmin = user?.rol_id === 2 || user?.rol_id === "Administrador";
  const isAgente = user?.rol_id === 3 || user?.rol_id === "Agente";

  // FILTROS
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  // TABS
  const [activeTab, setActiveTab] = useState('details');


  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([cargarTickets(), cargarAgentes()]);
    setLoading(false);
  };

  const cargarTickets = async () => {
    try {
      const endpoint = (isAgente && !isAdmin) ? '/tickets/assigned' : '/tickets';

      const response = await api.get(endpoint);
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      setTickets([]);
    }
  };

  const cargarAgentes = async () => {
    try {
      const response = await api.get('/users', { params: { rol: 3 } });
      setAgentes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error cargando agentes:', error);
      setAgentes([]);
    }
  };

  const asignarAgente = async (ticketId, agenteId) => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${ticketId}`, { responsable_id: agenteId || null });
      alert('Agente asignado correctamente');
      await cargarTickets();
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al asignar agente';
      alert(`${mensaje}`);
    } finally {
      setUpdating(false);
    }
  };

  const actualizarEstado = async (ticketId, nuevoEstadoId) => {
    setUpdating(true);
    try {
      await api.put(`/tickets/${ticketId}`, { estado_id: nuevoEstadoId });
      alert('Estado actualizado correctamente');
      await cargarTickets();
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error al actualizar estado';
      alert(`${mensaje}`);
    } finally {
      setUpdating(false);
    }
  };

  // ===============================
  // FILTRAR TICKETS
  // ===============================

  const filteredTickets = useMemo(() => {

    if (!Array.isArray(tickets)) return [];

    let resultado = [];

    // FILTRO POR ROL
    if (isAdmin) {
      resultado = tickets;
    } else if (isAgente) {
      resultado = tickets.filter(
        t => t.responsable_id === user?.id
      );
    } else {
      resultado = tickets.filter(
        t => t.usuario_id === user?.id
      );
    }

    // FILTRO ESTADO
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(
        t =>
          t.estado_nombre?.toLowerCase() ===
          filtroEstado
      );
    }

    // FILTRO FECHA
    if (filtroFecha) {
      resultado = resultado.filter(t => {

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
    isAdmin,
    isAgente,
    user?.id,
    filtroEstado,
    filtroFecha
  ]);

  // ===============================
  // TICKET SELECCIONADO
  // ===============================

  const selectedTicket = useMemo(
    () =>
      tickets.find(
        t => t.id === selectedTicketId
      ) || null,
    [tickets, selectedTicketId]
  );

  // ===============================
  // SELECCIONAR TICKET
  // ===============================

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);

    setTimeout(() => {
      detailRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // LOADING

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // ===============================
  // RENDER
  // ===============================

  return (
  <div className="p-4 sm:p-6 bg-gray-50 min-h-screen overflow-hidden">
            {/* HEADER */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {isAdmin
                ? ' Todos los Tickets'
                : ' Bandeja de entrada'}
            </h1>

            <p className="text-sm sm:text-base text-gray-500 mb-6">
              {isAdmin
                ? 'Gestiona todos los tickets del sistema'
                : 'Tus tickets y solicitudes'}
            </p>

            {/* FILTROS */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-6">

              <div className="flex flex-wrap items-center gap-3">

                <button
                  onClick={() => setFiltroEstado('todos')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${filtroEstado === 'todos'
                      ? 'bg-gray-900 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Todos
                </button>

                <button
                  onClick={() => setFiltroEstado('abierto')}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${filtroEstado === 'abierto'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Abiertos
                </button>

                <button
                  onClick={() => setFiltroEstado('cerrado')}
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
                      setFiltroFecha(e.target.value)
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

                {filteredTickets.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                    No hay tickets
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (

                    <div
                      key={ticket.id}
                      onClick={() =>
                        handleSelectTicket(ticket.id)
                      }
                      className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selectedTicketId === ticket.id
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
                          {ticket.prioridad_nombre || 'Media'}
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


                      </div>

                      <div className="mt-2 text-xs text-gray-400 break-words">

                        {ticket.usuario_nombre || 'Usuario'}

                        {ticket.responsable_nombre &&
                          ` |  ${ticket.responsable_nombre}`}

                      </div>

                    </div>
                  ))
                )}

              </div>

              {/* DETALLE */}
              <div
                className="lg:col-span-2"
                ref={detailRef}
              >

                {selectedTicket ? (

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">

                    {/* HEADER */}
                    <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">

                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-4">

                        <div className="w-full">

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

                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">

                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                          {selectedTicket.usuario_nombre
                            ?.charAt(0)
                            ?.toUpperCase() || 'U'}
                        </div>

                        <span>
                          Creado por{' '}
                          <span className="font-medium text-gray-700">
                            {selectedTicket.usuario_nombre ||
                              'N/A'}
                          </span>
                        </span>

                      </div>

                    </div>

                    {/* TABS */}
                    <div className="flex border-b border-gray-100 bg-white px-4 overflow-x-auto">

                      <button
                        onClick={() => setActiveTab('details')}
                        className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'details'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Detalles
                      </button>

                      <button
                        onClick={() => setActiveTab('comments')}
                        className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'comments'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Comentarios
                      </button>

                      <button
                        onClick={() => setActiveTab('activity')}
                        className={`px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === 'activity'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Actividad
                      </button>

                    </div>

                    {/* TAB DETALLES */}
                    {activeTab === 'details' && (

                      <div>

                        {/* DESCRIPCIÓN */}
                        <div className="p-5 sm:p-6 border-b border-gray-100">

                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Descripción
                          </h3>

                          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">

                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                              {selectedTicket.descripcion}
                            </p>

                          </div>

                        </div>

                        {/* INFORMACIÓN */}
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
                                {selectedTicket.area_nombre ||
                                  'No asignada'}
                              </p>

                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 shadow-sm">

                              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                                Categoría
                              </p>

                              <p className="text-sm font-semibold text-gray-800">
                                {selectedTicket.categoria_nombre ||
                                  'No asignada'}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* ESTADOS */}
                        {(isAdmin || isAgente) && (
                          <div className="p-5 sm:p-6 border-b border-gray-100">

                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Actualizar Estado
                            </h3>

                            <div className="flex flex-wrap gap-3">

                              {estadosTicket.map((estado) => (
                                <button
                                  key={estado.id}
                                  onClick={() =>
                                    actualizarEstado(
                                      selectedTicket.id,
                                      estado.id
                                    )
                                  }
                                  disabled={updating}
                                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${selectedTicket.estado_id ===
                                      estado.id
                                      ? 'bg-amber-500 text-white shadow-lg scale-105'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                  {estado.nombre}
                                </button>
                              ))}

                            </div>

                          </div>
                        )}

                      </div>

                    )}

                    {/* TAB COMENTARIOS */}
                    {activeTab === 'comments' && (

                      <div className="bg-gray-50/50">

                        <TicketComments
                          ticketId={selectedTicket.id}
                          ticketEstadoId={
                            selectedTicket.estado_id
                          }
                          ticketEstadoNombre={
                            selectedTicket.estado_nombre
                          }
                        />

                      </div>

                    )}

                    {/* TAB ACTIVIDAD */}
                    {activeTab === 'activity' && (

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
                                {selectedTicket.estado_nombre}
                              </p>
                            </div>

                          </div>

                          {selectedTicket.responsable_nombre && (
                            <div className="flex gap-4">

                              <div className="w-3 h-3 rounded-full bg-amber-500 mt-2"></div>

                              <div>
                                <p className="font-medium text-gray-800">
                                  Asignado a
                                </p>

                                <p className="text-sm text-gray-500">
                                  {selectedTicket.responsable_nombre}
                                </p>
                              </div>

                            </div>
                          )}

                        </div>

                      </div>

                    )}

                    {/* FOOTER */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">

                      <p className="text-xs text-gray-400 text-center">
                        Sistema de Tickets • Versa Ticket
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 text-center text-gray-500 h-full flex flex-col justify-center items-center min-h-[500px]">

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Ningún ticket seleccionado
                    </h3>

                    <p className="text-gray-500 max-w-md leading-relaxed">
                      Selecciona un ticket de la lista izquierda para ver toda la información.
                    </p>

                  </div>

                )}

              </div>

            </div>
          </div>
          );
};

          export default Inbox;