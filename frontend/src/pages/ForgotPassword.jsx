import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ForgotPassword() {
  const [email,    setEmail]   = useState('')
  const [loading,  setLoading] = useState(false)
  const [enviado,  setEnviado] = useState(false)
  const [error,    setError]   = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/forgot-password', { email })
      setEnviado(true)
    } catch {
      setError('No se pudo procesar la solicitud. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        <div className="mb-6 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Olvidé mi contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresá tu email y te enviamos un link para restablecerla.
          </p>
        </div>

        {enviado ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center">
              <div className="text-2xl mb-2">📧</div>
              <strong>¡Listo!</strong> Si el email existe en el sistema, vas a recibir un link en los próximos minutos.
              <br />
              <span className="text-xs text-green-600 mt-1 block">
                Revisá también la carpeta de spam.
              </span>
            </div>
            <p className="text-center text-xs text-gray-400">
              ¿No llegó el email? Pedile al administrador que resetee tu contraseña desde la sección Usuarios.
            </p>
            <Link to="/login"
              className="block w-full text-center py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              ← Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="tucorreo@aubasa.com.ar"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors">
              {loading ? 'Enviando…' : 'Enviar link de recuperación'}
            </button>
            <Link to="/login"
              className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Volver al login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
