// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios'; 

import {
  LayoutDashboard,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  TrendingUp,
  Star,
  Zap
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-amber-500" />
                Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {user?.rol_id === 2 && <p className="text-gray-600 text-sm">Visión completa del sistema</p>}
                {user?.rol_id === 3 && <p className="text-gray-600 text-sm">Tickets asignados a ti</p>}
                {user?.rol_id === 1 && <p className="text-gray-600 text-sm">Tus tickets y solicitudes</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={user?.rol_id === 3 ? "Tickets Asignados" : "Total Tickets"}
            value={stats.totalTickets}
            icon={Ticket}
            color="bg-blue-500"
          />
          <StatCard
            title={user?.rol_id === 3 ? "Por Atender" : "Pendientes"}
            value={stats.pendingTickets}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="En Proceso"
            value={stats.inProgressTickets}
            icon={AlertCircle}
            color="bg-orange-500"
          />
          <StatCard
            title={user?.rol_id === 3 ? "Resueltos" : "Completados"}
            value={stats.completedTickets}
            icon={CheckCircle2}
            color="bg-green-500"
          />
        </div>

        {/* Usuarios registrados (Solo Admin) */}
        {user?.rol_id === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Usuarios Registrados</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Métricas */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Tasa de Resolución"
            value={tasaCompletados}
            icon={CheckCircle2}
            color="from-green-500 to-green-600"
            unit="%"
            description="Tickets resueltos exitosamente"
          />
          <MetricCard
            title="Tickets Activos"
            value={totalActivos}
            icon={TrendingUp}
            color="from-amber-500 to-orange-500"
            unit=""
            description="Pendientes + En proceso"
          />
          <MetricCard
            title="Eficiencia"
            value={stats.totalTickets > 0 ? Math.min(100, Math.round((stats.completedTickets / stats.totalTickets) * 100)) : 0}
            icon={Star}
            color="from-blue-500 to-blue-600"
            unit="%"
            description="Rendimiento general"
          />
          {/* TARJETA MTTR */}
          <MetricCard
            title="Tiempo Medio (MTTR)"
            value={stats.mttr}
            icon={Clock}
            color="from-purple-500 to-purple-600"
            unit=" hrs"
            description="Promedio de cierre de tickets"
          />
        </div>

        {/* Distribución por Prioridad (Solo Admin) */}
        {user?.rol_id === 2 && dashboardData.prioridadesStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">Distribución por Prioridad</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.prioridadesStats.map((prioridad, index) => {
                  const porcentaje = stats.totalTickets > 0
                    ? (prioridad.total / stats.totalTickets) * 100
                    : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={getPrioridadTextColor(prioridad.nombre)}>
                          {prioridad.nombre}
                        </span>
                        <span className="font-semibold">{prioridad.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getPrioridadColor(prioridad.nombre)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tickets por Día (Solo Admin) */}
        {user?.rol_id === 2 && dashboardData.ticketsPorDia.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-800">Tickets por Día (Últimos 7 días)</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-4 h-64">
                {dashboardData.ticketsPorDia.slice().reverse().map((dia, index) => {
                  const maxValue = Math.max(...dashboardData.ticketsPorDia.map(d => d.total), 1);
                  const height = (dia.total / maxValue) * 200;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-2">{dia.total}</div>
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}px`, minHeight: '4px' }}
                      />
                      <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                        {dia.fecha ? new Date(dia.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }) : 'N/A'}
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
  );
};

// ==================== Componentes Auxiliares ====================
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

const MetricCard = ({ title, value, icon: Icon, color, unit, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-600 font-medium">{title}</h3>
      <div className={`bg-gradient-to-r ${color} p-2 rounded-lg`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </div>
    <div className="flex items-baseline gap-1 mb-2">
      <span className="text-3xl font-bold text-gray-800">{value}</span>
      <span className="text-gray-500">{unit}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
      <div
        className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
    <p className="text-sm text-gray-500">{description}</p>
  </div>
);

export default Dashboard;