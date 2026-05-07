import { useState, useEffect } from 'react'
import { ArrowLeft, UploadCloud, X, Paperclip } from 'lucide-react'
import mascot from '../assets/mascota.png'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'


export function CreateTicketForm() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [areas, setAreas] = useState([])
    const [prioridades, setPrioridades] = useState([])
    const [categorias, setCategorias] = useState([])

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        prioridad_id: '2',
        categoria_id: '',
        area_id: ''
    })

    const [archivos, setArchivos] = useState([])
    const [responsables, setResponsables] = useState([])
    const [camposDinamicos, setCamposDinamicos] = useState([])
    const [valoresDinamicos, setValoresDinamicos] = useState({})

    // 1. CARGA INICIAL CON AXIOS
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Hacemos todas las peticiones en paralelo para que sea súper rápido
                const [resAreas, resPrioridades, resUsuarios] = await Promise.all([
                    api.get("/catalogos/areas"),
                    api.get("/catalogos/prioridades"),
                    api.get("/users") // Si esta falla por permisos, asegúrate de manejarlo en el back
                ])

                setAreas(resAreas.data)
                setPrioridades(resPrioridades.data)
                setResponsables(resUsuarios.data)
            } catch (error) {
                console.error("Error cargando catálogos iniciales:", error)
            }
        }
        fetchData()
    }, [])

    // 2. CARGA DINÁMICA DE CATEGORÍAS Y CAMPOS POR ÁREA
    useEffect(() => {
        if (!formData.area_id) {
            setCategorias([])
            setCamposDinamicos([])
            setValoresDinamicos({})
            return
        }

        const fetchDatosPorArea = async () => {
            try {
                // Peticiones simultáneas con Axios
                const [resCat, resCampos] = await Promise.all([
                    api.get(`/catalogos/categorias/${formData.area_id}`),
                    api.get(`/campos/area/${formData.area_id}`)
                ])

                setCategorias(resCat.data)
                // 🛡️ EL BLINDAJE: Nos aseguramos de que sea un arreglo
                const camposArray = Array.isArray(resCampos.data) ? resCampos.data : [];
                setCamposDinamicos(camposArray)

                // Inicializamos los valores de los campos dinámicos de forma segura
                const valoresIniciales = {}
                camposArray.forEach(campo => {
                    valoresIniciales[campo.id] = campo.tipo_dato === 'checkbox' ? false : ''
                })
                setValoresDinamicos(valoresIniciales)

            } catch (error) {
                console.error("Error cargando datos del área:", error)
                // Si falla, reseteamos a arreglos vacíos para que no explote
                setCategorias([])
                setCamposDinamicos([])
            }
        }

        fetchDatosPorArea()
    }, [formData.area_id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value, ...(name === "area_id" && { categoria_id: "" }) }))
    }

    const handleDynamicChange = (campoId, valor) => {
        setValoresDinamicos(prev => ({
            ...prev,
            [campoId]: valor
        }))
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        setArchivos(prev => [...prev, ...files])
        e.target.value = null
    }

    const removeFile = (indexToRemove) => {
        setArchivos(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    // 3. ENVÍO DE FORMULARIO CON AXIOS
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            //1. crear contenedor de formulario
            const formDataPayload = new FormData();
            //2. agregar campos al contenedor
            formDataPayload.append('titulo', formData.titulo);
            formDataPayload.append('descripcion', formData.descripcion);
            formDataPayload.append('prioridad_id', Number(formData.prioridad_id));
            formDataPayload.append('categoria_id', Number(formData.categoria_id));
            formDataPayload.append('area_id', Number(formData.area_id));
            formDataPayload.append('estado_id', 1);
            formDataPayload.append('usuario_id', user?.id); // Asignamos el ticket al usuario que lo crea


            //convertir a string para procesar los datos
            if(valoresDinamicos){
                formDataPayload.append('campos_dinamicos', JSON.stringify(valoresDinamicos));
            }
            // agregar archivos al contenedor
            archivos.forEach((file) => {
                formDataPayload.append('archivos', file);
            });

            //4. enviar formulario con axios
            const response = await api.post('/tickets', formDataPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Ticket creado en Cloudinary:", response.data);
            alert("Ticket con evidencias creados exitosamente!");

            // Limpieza del formulario
            setFormData({ titulo: '', descripcion: '', prioridad_id: '2', categoria_id: '', area_id: '' });
            setArchivos([]);
            setValoresDinamicos({});

            // lo mandamos a la bandeja
            navigate('/inbox');

        } catch (error) {
            console.error("Error creando ticket:", error)
            alert(error.response?.data?.message || "Error al subir el ticket a la nube")
        }
    }

    return (
        <div className="flex-1 overflow-auto">
            <div className="min-h-full bg-background p-6">
                <button className="mb-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Regresar a tickets
                </button>

                <div className="mb-6 rounded-lg bg-primary px-6 py-5">
                    <h1 className="text-2xl font-bold text-primary-foreground">Crear un nuevo Ticket</h1>
                    <p className="text-primary-foreground/80">Llena a detalle el formulario para resolver el problema</p>
                </div>

                <div className="flex gap-6">
                    <div className="flex-1 rounded-lg border border-border bg-white p-6 shadow-sm">
                        <div className="mb-4 border-l-4 border-accent pl-4">
                            <h2 className="text-xl font-semibold text-primary">Detalles del Ticket</h2>
                        </div>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Proporciona toda la información relevante para que nuestro equipo pueda ayudarte de manera eficiente.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="titulo" className="block text-sm font-medium text-foreground">
                                    Título <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    placeholder="Resumen del problema"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="descripcion" className="block text-sm font-medium text-foreground">
                                    Descripción <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    placeholder="Describe el problema con el mayor detalle posible..."
                                    rows={4}
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="prioridad_id" className="block text-sm font-medium text-foreground">Prioridad <span className="text-destructive">*</span></label>
                                    <select id="prioridad_id" name="prioridad_id" value={formData.prioridad_id} onChange={handleChange} className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20">
                                        {prioridades.map((p) => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="categoria_id" className="block text-sm font-medium text-foreground">Categoría <span className="text-destructive">*</span></label>
                                    <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleChange} required className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20">
                                        <option value="">Selecciona la categoría</option>
                                        {categorias.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="area_id" className="block text-sm font-medium text-foreground">Área <span className="text-destructive">*</span></label>
                                <select id="area_id" name="area_id" value={formData.area_id} onChange={handleChange} required className="w-full rounded-lg border border-input bg-white px-4 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20">
                                    <option value="">Selecciona el área</option>
                                    {areas.map((a) => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
                                </select>
                            </div>

                            {camposDinamicos.length > 0 && (
                                <div className="space-y-4 border-t pt-4 mt-4">
                                    <h3 className="font-semibold text-primary flex items-center gap-2">
                                        <span>✨</span> Información específica del Área
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {camposDinamicos.map(campo => {
                                            const opciones = campo.opciones ?
                                                (typeof campo.opciones === 'string' ? JSON.parse(campo.opciones) : campo.opciones)
                                                : [];

                                            return (
                                                <div key={campo.id} className="space-y-2">
                                                    <label className="block text-sm font-medium text-foreground">
                                                        {campo.nombre_campo} {campo.requerido && <span className="text-destructive">*</span>}
                                                    </label>

                                                    {campo.tipo_dato === 'text' && (
                                                        <input
                                                            type="text"
                                                            required={campo.requerido}
                                                            value={valoresDinamicos[campo.id] || ''}
                                                            onChange={(e) => handleDynamicChange(campo.id, e.target.value)}
                                                            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                                                        />
                                                    )}

                                                    {campo.tipo_dato === 'select' && (
                                                        <select
                                                            required={campo.requerido}
                                                            value={valoresDinamicos[campo.id] || ''}
                                                            onChange={(e) => handleDynamicChange(campo.id, e.target.value)}
                                                            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                                                        >
                                                            <option value="">Selecciona una opción</option>
                                                            {opciones.map((opt, idx) => (
                                                                <option key={idx} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground">
                                    Evidencia Adjunta (Opcional)
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-input border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Haz clic para subir</span> o arrastra tus archivos</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, PDF (Max. 5MB)</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} />
                                    </label>
                                </div>

                                {archivos.length > 0 && (
                                    <ul className="mt-4 space-y-2">
                                        {archivos.map((file, idx) => (
                                            <li key={idx} className="flex items-center justify-between p-2 text-sm border border-border rounded-md bg-muted/10">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span className="truncate max-w-xs">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                                <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:text-red-700 p-1" title="Eliminar archivo">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border">
                                <button type="button" className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors">
                                    Crear Ticket
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="hidden w-72 space-y-4 lg:block">
                        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                            <div className="bg-primary p-6 text-center">
                                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-lg bg-primary-foreground/10">
                                    <img src={mascot} alt="Mascot" className="h-16 w-16" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary-foreground">¿Necesitas Ayuda?</h3>
                                <p className="mt-1 text-sm text-primary-foreground/80">
                                    ¡Nuestro equipo está aquí para ayudarte! Completa el formulario y te responderemos pronto.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
                            <h3 className="mb-3 flex items-center gap-2 font-semibold text-primary">
                                <span>📋</span> Consejos para Mejores Tickets
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Sé específico y claro en el título</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Incluye pasos para reproducir el problema</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Adjunta capturas de pantalla si aplica</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">•</span>Selecciona el nivel de prioridad apropiado</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}