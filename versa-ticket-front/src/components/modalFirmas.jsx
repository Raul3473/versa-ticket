// components/modalFirmas.jsx
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import api from '../api/axios';

const SignatureModal = ({ ticketId, onClose, onSuccess }) => {
    const padRef = useRef({});
    const [saving, setSaving] = useState(false);

    const limpiarFirma = () => {
        padRef.current.clear();
    };

    const guardarFirma = async () => {
        if (padRef.current.isEmpty()) {
            alert("Por favor, ingresa una firma antes de guardar.");
            return;
        }

        setSaving(true);
        // Obtenemos la imagen en Base64
        const firmaBase64 = padRef.current.getCanvas().toDataURL('image/png');

        try {
            // Llamamos a nuestra nueva ruta del backend
            await api.put(`/tickets/${ticketId}/firmar`, { firma_base64: firmaBase64 });
            alert("Ticket cerrado y firmado exitosamente.");
            onSuccess(); // Recargamos los tickets en el Inbox
        } catch (error) {
            console.error(error);
            alert("Error al guardar la firma");
        } finally {
            setSaving(false);
            onClose(); // Cerramos el modal
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Firma de Conformidad</h3>
                    <p className="text-sm text-gray-500">Dibuja tu firma para cerrar el ticket #{ticketId}</p>
                </div>

                <div className="p-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <SignatureCanvas 
                            ref={padRef}
                            canvasProps={{
                                className: 'w-full h-48 rounded-lg cursor-crosshair'
                            }}
                        />
                    </div>
                    <button 
                        onClick={limpiarFirma}
                        className="mt-2 text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                        Borrar y dibujar de nuevo
                    </button>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        disabled={saving}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={guardarFirma}
                        disabled={saving}
                        className="px-4 py-2 text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition flex items-center"
                    >
                        {saving ? 'Guardando...' : 'Firmar y Cerrar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignatureModal;