// src/api/axios.js 
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://versa-ticket.onrender.com/api',
  timeout: 10000,
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    console.log('Interceptor - Token existe?', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token agregado a:', config.url);
    } else {
      console.warn('No hay token para:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//Interceptor de respuestas para blindar la sesión
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (200, 201), la dejamos pasar sin hacer nada
    return response;
  },
  (error) => {
    // Si el backend nos rechaza con un 401 (Token expirado o inválido)
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o inválida. Limpiando datos y redirigiendo...');
      
      // 1. Limpiamos tu almacenamiento local de la sesión
      sessionStorage.removeItem('token');
      // para usuario en sessionStorage
      // sessionStorage.removeItem('user'); 
      
      // 2. Forzamos la redirección al login (Esto recarga la app y limpia estados de React)
      window.location.href = '/login'; 
    }
    
    // Devolvemos el error para que los bloques catch de tus componentes también se enteren
    return Promise.reject(error);
  }
);

export default api;