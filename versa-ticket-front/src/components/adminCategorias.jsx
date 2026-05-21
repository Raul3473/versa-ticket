import { useEffect, useState } from "react";
import api from '../api/axios';

// Componente para administración de categorías de tickets (CRUD básico)
export function AdminCategorias({ user, permisos }) {
    const [categorias, setCategorias] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [originalCategoria, setOriginalCategoria] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [areas, setAreas] = useState([]); // Catálogo de áreas para el select

    //logica de permisos    
    const can = (permisos, module, action) => {
        return permisos?.[module]?.[action] === true;
    };
    const canCreate = can(permisos, "categorias", "create");
    const canEdit = can(permisos, "categorias", "update");
    const canDelete = can(permisos, "categorias", "delete");
    const canRead = can(permisos, "categorias", "read");

    const isEdit = !!originalCategoria;

    const fetchCategorias = async () => {
        try {
            // Asumiendo que tu endpoint backend será algo como /api/categorias
            const res = await api.get("https://versa-ticket.onrender.com/api/categorias");
            setCategorias(res.data);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    };

    const fetchAreas = async () => {
        try {
            const res = await fetch("https://versa-ticket.onrender.com/api/catalogos/areas");
            const data = await res.json();
            setAreas(data);
        } catch (error) {
            console.error("Error cargando áreas:", error);
        }
    };

    useEffect(() => {
        fetchCategorias();
        fetchAreas();
    }, []);

    const handleEdit = (categoria) => {
        if (!canEdit) return;
        setSelectedCategoria({ ...categoria });
        setOriginalCategoria({ ...categoria });
        setShowModal(true);
    };

    const handleDelete = async (categoria) => {
        if (!canDelete) return;
        if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;

        try {
            await fetch(`https://versa-ticket.onrender.com/api/categorias/${categoria.id}`, {
                method: "DELETE",
            });
            setCategorias((prev) => prev.filter(c => c.id !== categoria.id));
        } catch (error) {
            console.error("Error eliminando:", error);
        }
    };

    const handleSave = async () => {
        if (isEdit && !canEdit) return;
        if (!isEdit && !canCreate) return;

        try {
            const url = isEdit
                ? `https://versa-ticket.onrender.com/api/categorias/${selectedCategoria.id}`
                : `https://versa-ticket.onrender.com/api/categorias`; // Ajusta la ruta de creación si es distinta
            const method = isEdit ? "PUT" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: selectedCategoria.nombre,
                    descripcion: selectedCategoria.descripcion,
                    area_id: selectedCategoria.area_id,
                    activo: selectedCategoria.activo !== undefined ? selectedCategoria.activo : true
                }),
            });

            await fetchCategorias();
            setShowConfirm(false);
            setShowModal(false);
            setSelectedCategoria(null);
        } catch (error) {
            console.error("Error guardando:", error);
        }
    };

    const getChanges = () => {
        if (!originalCategoria || !selectedCategoria) return [];
        const changes = [];

        if (originalCategoria.nombre !== selectedCategoria.nombre) {
            changes.push({ field: "Nombre", before: originalCategoria.nombre, after: selectedCategoria.nombre });
        }
        if (originalCategoria.descripcion !== selectedCategoria.descripcion) {
            changes.push({ field: "Descripción", before: originalCategoria.descripcion, after: selectedCategoria.descripcion });
        }
        if (originalCategoria.area_id !== selectedCategoria.area_id) {
            const before = areas.find(a => a.id === originalCategoria.area_id)?.nombre;
            const after = areas.find(a => a.id === selectedCategoria.area_id)?.nombre;
            changes.push({ field: "Área", before, after });
        }
        if (originalCategoria.activo !== selectedCategoria.activo) {
            changes.push({ field: "Activo", before: originalCategoria.activo ? "Sí" : "No", after: selectedCategoria.activo ? "Sí" : "No" });
        }

        return changes;
    };

    if (!canRead) {
        return (
            <div className="p-6">
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    No tienes permiso para ver categorías.
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Categorias de tickets</h2>
                    <p className="text-sm text-gray-500 italic">Categorias a las que puede pertenecer un ticket</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => openModal()}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
                    >
                        + Nueva Área
                    </button>
                )}
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Área</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Activo</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(categorias) && categorias.map((c) => (
                            <tr key={c.id} className="thover:bg-amber-50/30 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-gray-400">{c.id}</td>
                                <td className="p-2 border font-medium">{c.nombre}</td>
                                <td className="p-2 border text-sm text-gray-600 truncate max-w-xs">{c.descripcion}</td>
                                <td className="p-2 border">{c.area_nombre || c.area_id}</td>
                                <td className="p-2 border">
                                    <span className={`px-2 py-1 rounded text-xs ${c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {c.activo ? "Sí" : "No"}
                                    </span>
                                </td>
                                <td className="p-2 border">
                                    <div className="flex justify-center gap-2">
                                        {canEdit && (
                                            <button onClick={() => handleEdit(c)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                                                Editar
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button onClick={() => handleDelete(c)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categorias.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-4 text-center text-gray-500">No hay categorías registradas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Formulario */}
            {showModal && selectedCategoria && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{isEdit ? "Editar Categoría" : "Nueva Categoría"}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={selectedCategoria.nombre}
                                    onChange={(e) => setSelectedCategoria({ ...selectedCategoria, nombre: e.target.value })}
                                    className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ej. Soporte Hardware"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    value={selectedCategoria.descripcion || ""}
                                    onChange={(e) => setSelectedCategoria({ ...selectedCategoria, descripcion: e.target.value })}
                                    className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Detalles de la categoría..."
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                                <select
                                    value={selectedCategoria.area_id || ""}
                                    onChange={(e) => setSelectedCategoria({ ...selectedCategoria, area_id: Number(e.target.value) })}
                                    className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">Selecciona un área</option>
                                    {areas.map((a) => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {isEdit && (
                                <div className="flex items-center mt-4">
                                    <input
                                        type="checkbox"
                                        id="activo"
                                        checked={selectedCategoria.activo}
                                        onChange={(e) => setSelectedCategoria({ ...selectedCategoria, activo: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                        Categoría Activa
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                                Cancelar
                            </button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                disabled={!selectedCategoria.nombre || !selectedCategoria.area_id}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isEdit ? "Siguiente" : "Siguiente"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Confirmar cambios</h2>

                        <div className="bg-gray-50 p-4 rounded mb-6">
                            {isEdit ? (
                                getChanges().length === 0 ? (
                                    <p className="text-gray-600">No hay cambios para guardar.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {getChanges().map((c, i) => (
                                            <li key={i} className="text-sm border-b pb-1 last:border-0">
                                                <span className="font-semibold text-gray-700">{c.field}:</span>{" "}
                                                <span className="line-through text-red-500 mr-1">{c.before}</span>{" "}
                                                <span className="text-green-600 font-medium">→ {c.after}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Se creará la siguiente categoría:</p>
                                    <ul className="text-sm space-y-1">
                                        <li><strong>Nombre:</strong> {selectedCategoria.nombre}</li>
                                        <li><strong>Área:</strong> {areas.find(a => a.id === selectedCategoria.area_id)?.nombre}</li>
                                        <li><strong>Descripción:</strong> {selectedCategoria.descripcion || "N/A"}</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                                Volver
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isEdit ? (getChanges().length === 0 || !canEdit) : !canCreate}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                Confirmar y Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}