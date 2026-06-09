import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { DocRef } from './ClasifLeyenda'

const links = [
  { to: '/',                  label: 'Panel',               icon: '◉' },
  { to: '/dashboard',         label: 'Dashboard',           icon: '📊' },
  { to: '/evaluacion',        label: 'Eval. Servicio',      icon: '📋', roles: ['admin','evaluador_tecnico','evaluador_compras'] },
  { to: '/evaluacion-insumo', label: 'Eval. Insumo',        icon: '📦' },
  { to: '/historial',         label: 'Historial Servicios', icon: '☰' },
  { to: '/historial-insumos', label: 'Historial Insumos',   icon: '☰' },
  { to: '/especificaciones',      label: 'Espec. Técnicas',   icon: '📄' },
  { to: '/listado-proveedores',   label: 'Proveed. Críticos', icon: '🏭' },
]

const adminLinks = [
  { to: '/especificaciones/nueva', label: 'Nueva ET',    icon: '⊕' },
  { to: '/usuarios',               label: 'Usuarios',    icon: '👥' },
]

const ROL_LABELS = {
  admin:              'Administrador',
  evaluador_tecnico:  'Evaluador Técnico',
  evaluador_compras:  'Evaluador Compras',
  lectura:            'Solo lectura',
}

function ModalPerfil({ onClose }) {
  const { usuario, actualizarNombre } = useAuth()
  const [nombre,  setNombre]  = useState(usuario?.nombre || '')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)
  const [ok,      setOk]      = useState(false)

  const handleGuardar = async e => {
    e.preventDefault()
    if (!nombre.trim()) return setError('El nombre no puede estar vacío')
    setSaving(true)
    setError(null)
    try {
      const { data } = await api.put('/auth/perfil', { nombre })
      actualizarNombre(data.nombre)
      setOk(true)
      setTimeout(onClose, 900)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Mi perfil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleGuardar} className="p-5 space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}
          {ok    && <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg">✓ Nombre actualizado</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Nombre completo
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="text-xs text-gray-400 mt-1">
              Este nombre aparece en las evaluaciones que registrás.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div>
              <span className="block text-gray-400">Email</span>
              <span className="font-medium text-gray-700">{usuario?.email}</span>
            </div>
            <div>
              <span className="block text-gray-400">Rol</span>
              <span className="font-medium text-gray-700">{ROL_LABELS[usuario?.rol] || usuario?.rol}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving || ok}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NavBar() {
  const { usuario, logout, tieneRol } = useAuth()
  const navigate = useNavigate()
  const [modalPerfil, setModalPerfil] = useState(false)

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-200 flex flex-col z-10">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="text-lg font-bold text-blue-800 leading-tight">AUBASA</div>
          <div className="text-xs text-gray-500 mt-0.5">Evaluación de Proveedores</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map(({ to, label, icon, roles }) => {
            if (roles && !tieneRol(...roles)) return null
            return (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                }>
                <span>{icon}</span>{label}
              </NavLink>
            )
          })}

          {tieneRol('admin') && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Administración</p>
              </div>
              {adminLinks.map(({ to, label, icon }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                  }>
                  <span>{icon}</span>{label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Pie: datos del usuario + botón perfil */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={() => setModalPerfil(true)}
            className="w-full text-left hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors group"
            title="Editar mi perfil"
          >
            <div className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
              {usuario?.nombre}
              <span className="ml-1 text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </div>
            <div className="text-xs text-gray-500 truncate">{usuario?.email}</div>
            <div className="text-xs text-blue-600 mt-0.5">{ROL_LABELS[usuario?.rol] || usuario?.rol}</div>
          </button>
          <button onClick={() => { logout(); navigate('/login') }}
            className="mt-2 text-xs text-gray-400 hover:text-red-600 transition-colors">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {modalPerfil && <ModalPerfil onClose={() => setModalPerfil(false)} />}

      {/* Referencia documental — fija arriba a la derecha en todas las páginas */}
      <div className="fixed top-3 right-4 z-20">
        <DocRef codigo="PAU/06-A01" revision="05" />
      </div>
    </>
  )
}
