// src/components/TicketComments.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TicketComments = ({ ticketId, ticketEstadoId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const commentsEndRef = useRef(null);

  // 1. Detección infalible de estado cerrado
  useEffect(() => {
    if (ticketEstadoId !== undefined && ticketEstadoId !== null) {
      const estadoNumerico = Number(ticketEstadoId);
      const ticketCerrado = [3, 4, 5].includes(estadoNumerico);
      setIsClosed(ticketCerrado);
      console.log(`Ticket Estado ID: ${estadoNumerico} | ¿Está cerrado?: ${ticketCerrado}`);
    } else {
      setIsClosed(false);
    }
  }, [ticketEstadoId]);

  // 2. Cargar comentarios
  useEffect(() => {
    if (!ticketId || ticketId === 'undefined') {
      setLoading(false);
      return;
    }
    cargarComentarios();
  }, [ticketId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const cargarComentarios = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/ticket/${ticketId}`);
      setComments(response.data.data || []);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isClosed || !newComment.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post(`/comments`, {
        ticket_id: ticketId,
        contenido: newComment.trim()
      });
      
      setComments(prev => [...prev, response.data.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error enviando comentario:', error);
      if (error.response?.status === 403) {
        setIsClosed(true); // Bloquear visualmente por seguridad
      }
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return;
    
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      // Mostramos el error del backend para que sepas exactamente por qué falló
      const mensaje = error.response?.data?.message || 'Error desconocido';
      alert(`No se pudo eliminar: ${mensaje}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-full">
      <div className="px-6 pt-4 pb-2 flex justify-between items-center border-b">
        <h3 className="font-semibold text-gray-800">
           Comentarios ({comments.length})
        </h3>
        {isClosed && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
            Ticket cerrado
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-[300px]">
        {comments.length === 0 ? (
          <div className="text-center text-gray-400 py-4">No hay comentarios aún.</div>
        ) : (
          comments.map((comment) => {
            // Evaluamos si NO está cerrado (!isClosed) 
            // si eres el admin (2) o el dueño del comentario. 
            // Si el ticket está cerrado, canDelete será FALSO y el basurero no se renderiza.
            const isAdmin = Number(user?.rol_id) === 2;
            const isOwner = Number(user?.id) === Number(comment.usuario_id);
            const canDelete = !isClosed && (isAdmin || isOwner);

            return (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {comment.usuario_nombre?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-semibold text-sm text-gray-800">
                          {comment.usuario_nombre}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatDate(comment.fecha)}
                        </span>
                      </div>
                      
                      {/* El basurero solo aparece si canDelete es true */}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-gray-400 hover:text-red-500 text-xs transition"
                          title="Eliminar comentario"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {comment.contenido}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isClosed ? "El ticket está cerrado. No puedes comentar." : "Escribe un comentario..."}
            rows="2"
            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition-colors ${
              isClosed ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300'
            }`}
            disabled={sending || isClosed}
          />
          <button
            type="submit"
            disabled={sending || !newComment.trim() || isClosed}
            className={`self-end px-4 py-2 rounded-lg font-medium transition-all ${
              isClosed || !newComment.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketComments;