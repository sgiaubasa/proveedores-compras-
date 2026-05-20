import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function CambiarPassword() {
  const { usuario, marcarPasswordCambiada, logout } = useAuth()
  const navigate = useNavigate()

  const [nueva,    setNueva]    = useState('')
  const [confirma, setConfirma] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)
  const esPrimerIngreso = usuario?.debeCambiarPassword === true

  const handleGuardar = async e => {
    e.preventDefault()
    setError(null)
    if (nueva.length < 6)      return setError('La contraseña debe tener al menos 6 caracteres')
    if (nueva !== confirma)     return setError('Las contraseñas no coinciden')
    setSaving(true)
    try {
      await api.put('/auth/cambiar-password', { nuevaPassword: nueva })
      marcarPasswordCambiada()
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Encabezado */}
        <div className="mb-6 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔐</span>
          </div>
          {esPrimerIngreso ? (
            <>
              <h1 className="text-xl font-bold text-gray-900">Bienvenido/a, {usuario?.nombre?.split(' ')[0]}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Es tu primer ingreso. Por seguridad, elegí una contraseña personal antes de continuar.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900">Cambiar contraseña</h1>
              <p className="text-sm text-gray-500 mt-1">Ingresá y confirmá tu nueva contraseña.</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={nueva}
              onChange={e => setNueva(e.target.value)}
              required
              autoFocus
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={confirma}
              onChange={e => setConfirma(e.target.value)}
              required
              placeholder="Repetí la contraseña"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {nueva && confirma && nueva !== confirma && (
              <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
            )}
            {nueva && confirma && nueva === confirma && (
              <p className="text-xs text-green-600 mt-1">✓ Contraseñas coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !nueva || !confirma || nueva !== confirma}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors mt-2">
            {saving ? 'Guardando…' : 'Guardar contraseña y continuar'}
          </button>
        </form>

        {/* Solo mostrar "saltar" si NO es primer ingreso forzado */}
        {!esPrimerIngreso && (
          <button onClick={() => navigate(-1)}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 text-center">
            Cancelar
          </button>
        )}

        {esPrimerIngreso && (
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full mt-4 text-xs text-gray-400 hover:text-gray-600 text-center">
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  )
}
