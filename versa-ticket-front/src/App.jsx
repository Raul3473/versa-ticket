// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Componentes
import Login from './pages/Login';
import Inbox from './pages/Inbox';
import Dashboard from './pages/Dashboard';
import AssignedTickets from './pages/AssignedTickets';
import { TicketSidebar } from './components/sideBar';
import { CreateTicketForm } from './pages/createTicket';
import AdminPanel from './pages/panelAdmin';

// 1. LAYOUT PRINCIPAL
// ----------------------------------------------------------------------
const MainLayout = () => {
    const auth = useAuth(); // Obtenemos el objeto completo primero

    // Si auth es null o está cargando, mostramos un spinner y no intentamos leer 'user'
    if (!auth || auth.loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const { user } = auth; // Ahora es seguro desestructurar

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <TicketSidebar />
            <div className="flex-1 overflow-auto ml-64 p-4">
                <Outlet context={{ user }} />
            </div>
        </div>
    );
};

// 2. RUTA ADMIN
// ----------------------------------------------------------------------
const AdminRoute = () => {
    const context = useOutletContext();
    
    // Si el contexto no existe o no tiene user, redirigimos
    if (!context || !context.user) {
        return <Navigate to="/login" replace />;
    }

    const { user } = context;
    
    if (user.rol_id !== 2) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return <AdminPanel />;
};

// 3. COMPONENTE APP
// ----------------------------------------------------------------------
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inbox" element={<Inbox />} />
                        <Route path="/create-ticket" element={<CreateTicketForm />} />
                        <Route path="/assigned-tickets" element={<AssignedTickets />} />
                        <Route path="/admin" element={<AdminRoute />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;