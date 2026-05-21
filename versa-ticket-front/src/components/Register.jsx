import { useState } from "react"

export function Register() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
    if (message.text) setMessage({ text: "", type: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("https://versa-ticket.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      })

      const result = await res.json()

      if (result.success) {
        setMessage({
          text: "Usuario creado correctamente",
          type: "success"
        })

        setForm({
          nombre: "",
          apellido: "",
          email: "",
          password: ""
        })

        setTimeout(() => {
          navigate("/login")
        }, 1500)
      } else {
        setMessage({
          text: result.message || "Error creando usuario",
          type: "error"
        })
      }
    } catch (error) {
      setMessage({
        text: "Error de conexión con el servidor",
        type: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md bg-white border border-border rounded-lg shadow-sm p-6">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-primary">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground">
            Regístrate para acceder a VersaTicket
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="nombre"
            value={form.nombre}
            placeholder="Nombre"
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full rounded-lg border border-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
          />

          <input
            name="apellido"
            value={form.apellido}
            placeholder="Apellido"
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full rounded-lg border border-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            placeholder="Correo electrónico"
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full rounded-lg border border-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Contraseña"
            onChange={handleChange}
            disabled={loading}
            required
            className="w-full rounded-lg border border-input px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
          />

          {message.text && (
            <div
              className={`text-sm text-center p-2 rounded ${message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:bg-accent/90 transition"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
          <a href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  )
}