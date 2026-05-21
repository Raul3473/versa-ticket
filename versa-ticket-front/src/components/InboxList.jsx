// src/components/InboxList.jsx
import React, { useState, useEffect } from 'react';

export default function InboxList({ onSelect, onOpenModal }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Usa la URL correcta
      const response = await fetch('https://versa-ticket.onrender.com/api/tickets');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Tickets cargados:', data);
      setTickets(data);
      setError(null);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      setError(error.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={fetchTickets}
          className="mt-2 text-blue-500 hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No hay tickets</p>
        <button
          onClick={onOpenModal}
          className="mt-2 text-blue-500 hover:underline"
        >
          Crear primer ticket
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onSelect(ticket)}
          className="p-4 hover:bg-gray-50 cursor-pointer transition"
        >
          <h3 className="font-medium text-gray-900">{ticket.titulo}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {ticket.descripcion}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              #{ticket.id}
            </span>
            {ticket.prioridad && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                {ticket.prioridad}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}