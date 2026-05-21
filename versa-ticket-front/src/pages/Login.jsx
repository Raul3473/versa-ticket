import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      // Pequeño delay para asegurar que el AuthContext se actualice
      setTimeout(() => {
        // Obtenemos los datos normalizados (user o usuario)
        const userData = data.user || data.usuario;
        
        console.log('Redireccionando usuario:', userData.nombre);
        
        // Redirección inteligente por Rol (Lógica del compañero)
        if (userData.rol_id === 2) {
          navigate('/admin');
        } else if (userData.rol_id === 3) {
          navigate('/assigned-tickets');
        } else {
          navigate('/inbox');
        }
      }, 100);
      
    } catch (error) {
      // Tu manejo de errores robusto (Senior style)
      if (error.message === "Network Error" || !error.response) {
        setError("No se pudo conectar con el servidor. ¿Está prendido el backend?");
      } else {
        setError(error.response?.data?.message || 'Credenciales incorrectas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Diseño visual del compañero
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#d0e8c8] to-[#b3e5fc] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
        
        {/* Header con Logos */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src="/Logo-Versa.svg" 
            alt="VersaTicket" 
            className="w-14 h-14 object-contain rounded-lg"
          />
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
            VERSATICKET
          </h1>
          <img 
            src="/mascota.svg" 
            alt="Mascot" 
            className="w-14 h-14 object-contain"
          />
        </div>
        
        <h2 className="text-xl font-bold text-gray-500 mb-8 text-center uppercase tracking-widest">
          Inicio de Sesión
        </h2>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg mb-6 text-sm animate-pulse">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
              placeholder="admin@versa.com"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-gray-600 text-sm font-bold mb-2 ml-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                VERIFICANDO...
              </span>
            ) : 'INGRESAR AL SISTEMA'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="#" className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase">
            ¿Problemas para acceder? Contacta a soporte
          </a>
        </div>

        <div className="text-center mt-10 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            © 2026 VersaTicket • Enterprise Edition v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;