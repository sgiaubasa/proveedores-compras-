import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function ResetPassword() {
  const { token }   = useParams()
  const navigate    = useNavigate()
  const [nueva,     setNueva]    = useState('')
  const [confirma,  setConfirma] = useState('')
  const [saving,    setSaving]   = useState(false)
  const [error,     setError]    = useState(null)
  const [ok,        setOk]       = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (nueva !== confirma) return setError('Las contraseñas no coinciden')
    if (nueva.length < 6)   return setError('Mínimo 6 caracteres')
    setSaving(true)
    setError(null)
    try {
      await api.post(`/auth/reset-password/${token}`, { nuevaPassword: nueva })
      setOk(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (e) {
      setError(e.response?.data?.error || 'El link es inválido o ya expiró')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        <div className="mb-6 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">Elegí una contraseña segura para tu cuenta.</p>
        </div>

        {ok ? (
          <div className="text-center space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <div className="text-2xl mb-1">✅</div>
              <strong>Contraseña cambiada correctamente.</strong><br />
              <span className="text-xs">Redirigiendo al login…</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input type="password" value={nueva} onChange={e => setNueva(e.target.value)}
                required autoFocus placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input type="password" value={confirma} onChange={e => setConfirma(e.target.value)}
                required placeholder="Repetí la contraseña"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              {nueva && confirma && (
                <p className={`text-xs mt-1 ${nueva === confirma ? 'text-green-600' : 'text-red-500'}`}>
                  {nueva === confirma ? '✓ Coinciden' : 'No coinciden'}
                </p>
              )}
            </div>
            <button type="submit" disabled={saving || nueva !== confirma || !nueva}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors">
              {saving ? 'Guardando…' : 'Establecer nueva contraseña'}
            </button>
            <Link to="/login"
              className="block w-full text-center text-sm text-gray-400 hover:text-gray-600">
              ← Volver al login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
