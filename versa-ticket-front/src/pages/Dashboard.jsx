// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import html2pdf from 'html2pdf.js';

import {
  LayoutDashboard,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  TrendingUp,
  Star,
  Zap,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
    totalUsers: 0,
    mttr: 0
  });

  const [dashboardData, setDashboardData] = useState({
    ticketsPorDia: [],
    prioridadesStats: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, dashboardResponse] = await Promise.all([
        api.get('/stats'),
        api.get('/stats/dashboard')
      ]);

      // Procesar estadísticas principales
      if (statsResponse.data?.success) {
        setStats({
          totalTickets: statsResponse.data.data?.totalTickets || 0,
          pendingTickets: statsResponse.data.data?.pendingTickets || 0,
          inProgressTickets: statsResponse.data.data?.inProgressTickets || 0,
          completedTickets: statsResponse.data.data?.completedTickets || 0,
          totalUsers: statsResponse.data.data?.totalUsers || 0,
          mttr: statsResponse.data.data?.mttr || 0
        });
      }

      // Procesar datos del dashboard
      if (dashboardResponse.data?.success) {
        setDashboardData({
          ticketsPorDia: Array.isArray(dashboardResponse.data.data?.ticketsPorDia)
            ? dashboardResponse.data.data.ticketsPorDia
            : [],
          prioridadesStats: Array.isArray(dashboardResponse.data.data?.prioridadesStats)
            ? dashboardResponse.data.data.prioridadesStats
            : []
        });
      }

    } catch (err) {
      console.error('Error cargando dashboard:', err);

      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        setError('Error al cargar los datos del dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadColor = (nombre) => {
    switch (nombre?.toLowerCase()) {
      case 'crítica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getPrioridadTextColor = (nombre) => {
    switch (nombre?.toLowerCase()) {
      case 'crítica': return 'text-red-600';
      case 'alta': return 'text-orange-600';
      case 'media': return 'text-yellow-600';
      case 'baja': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const totalActivos = stats.pendingTickets + stats.inProgressTickets;
  const tasaCompletados = stats.totalTickets > 0
    ? Math.round((stats.completedTickets / stats.totalTickets) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-8 max-w-7xl mx-auto"> {/* Contenedor máximo para no estirarse al infinito */}

        {/* Header */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="h-7 w-7 text-amber-500" />
                Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {user?.rol_id === 2 && <p className="text-gray-500 text-sm font-medium">Visión completa del sistema</p>}
                {user?.rol_id === 3 && <p className="text-gray-500 text-sm font-medium">Tickets asignados a ti</p>}
                {user?.rol_id === 1 && <p className="text-gray-500 text-sm font-medium">Tus tickets y solicitudes</p>}
              </div>
            </div>

            {/* Btn de Exportar Reporte (admin y agentes) */}
            {(user?.rol_id === 2 || user?.rol_id === 3) && (
              <button
                onClick={() => {
                  const element = document.getElementById('reporte-dashboard');
                  const opt = {
                    margin: 0.3,
                    filename: `Reporte_Directivo_Versa_${new Date().toISOString().split('T')[0]}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, windowWidth: 1200 }, // Forzamos un ancho para el PDF
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                  };
                  html2pdf().set(opt).from(element).save();
                }}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-all"
              >
                <FileText className="h-4 w-4" />
                Exportar Reporte
              </button>
            )}
          </div>
        </div>

        {/* CONTENEDOR PARA EL PDF */}
        <div id="reporte-dashboard" className="space-y-6 bg-gray-50">

          {/* Tarjetas de estadísticas - Grid más compacto */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={user?.rol_id === 3 ? "Asignados" : "Total Tickets"} value={stats.totalTickets} icon={Ticket} color="bg-blue-500" />
            <StatCard title={user?.rol_id === 3 ? "Por Atender" : "Pendientes"} value={stats.pendingTickets} icon={Clock} color="bg-yellow-500" />
            <StatCard title="En Proceso" value={stats.inProgressTickets} icon={AlertCircle} color="bg-orange-500" />
            <StatCard title={user?.rol_id === 3 ? "Resueltos" : "Completados"} value={stats.completedTickets} icon={CheckCircle2} color="bg-green-500" />
          </div>

          {/* Métricas - Acomodadas en 4 columnas para usar todo el ancho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Resolución" value={tasaCompletados} icon={CheckCircle2} color="from-green-500 to-green-600" unit="%" description="Tickets resueltos" />
            <MetricCard title="Activos" value={totalActivos} icon={TrendingUp} color="from-amber-500 to-orange-500" unit="" description="En proceso/Pendientes" />
            <MetricCard title="Eficiencia" value={stats.totalTickets > 0 ? Math.min(100, Math.round((stats.completedTickets / stats.totalTickets) * 100)) : 0} icon={Star} color="from-blue-500 to-blue-600" unit="%" description="Rendimiento general" />
            <MetricCard title="MTTR" value={stats.mttr} icon={Clock} color="from-purple-500 to-purple-600" unit=" hrs" description="Promedio de cierre" />
          </div>

          {/* Sección Inferior: Usuarios y Gráficas Lado a Lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Columna Izquierda: Usuarios y Prioridades */}
            <div className="space-y-6">
              {user?.rol_id === 2 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Usuarios Registrados</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalUsers || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              )}

              {user?.rol_id === 2 && dashboardData.prioridadesStats.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <h3 className="text-base font-semibold text-gray-700">Distribución por Prioridad</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      {dashboardData.prioridadesStats.map((prioridad, index) => {
                        const porcentaje = stats.totalTickets > 0 ? (prioridad.total / stats.totalTickets) * 100 : 0;
                        return (
                          <div key={index}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className={`font-medium ${getPrioridadTextColor(prioridad.nombre)}`}>{prioridad.nombre}</span>
                              <span className="font-bold text-gray-700">{prioridad.total}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`${getPrioridadColor(prioridad.nombre)} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${porcentaje}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Gráfica de Barras */}
            {user?.rol_id === 2 && dashboardData.ticketsPorDia.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    <h3 className="text-base font-semibold text-gray-700">Actividad (Últimos 7 días)</h3>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-end">
                  <div className="flex items-end gap-3 h-48">
                    {dashboardData.ticketsPorDia.slice().reverse().map((dia, index) => {
                      const maxValue = Math.max(...dashboardData.ticketsPorDia.map(d => d.total), 1);
                      const height = (dia.total / maxValue) * 100; // Porcentaje de altura
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                          <div className="text-[10px] font-medium text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{dia.total}</div>
                          <div
                            className="w-full max-w-[40px] bg-amber-400 hover:bg-amber-500 rounded-t-sm transition-all duration-300"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          />
                          <div className="text-[10px] font-medium text-gray-400 mt-2 truncate w-full text-center">
                            {dia.fecha ? new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short' }) : '-'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Componentes Auxiliares Ajustados ====================
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-4">
    <div className={`${color} p-3 rounded-lg shrink-0`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, color, unit, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <div className={`bg-gradient-to-r ${color} p-1.5 rounded-md`}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
    </div>
    <div className="flex items-baseline gap-1 mb-2">
      <span className="text-2xl font-bold text-gray-800">{value}</span>
      <span className="text-xs font-medium text-gray-500">{unit}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
      <div className={`bg-gradient-to-r ${color} h-1.5 rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{description}</p>
  </div>
);

export default Dashboard;