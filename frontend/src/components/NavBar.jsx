import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/',                  label: 'Panel',             icon: '◉' },
  { to: '/evaluacion',        label: 'Eval. Servicio',    icon: '📋', roles: ['admin','evaluador_tecnico','evaluador_compras'] },
  { to: '/evaluacion-insumo', label: 'Eval. Insumo',      icon: '📦', roles: ['admin','evaluador_compras'] },
  { to: '/historial',         label: 'Historial Servicios', icon: '☰' },
  { to: '/historial-insumos', label: 'Historial Insumos', icon: '☰' },
  { to: '/especificaciones',      label: 'Espec. Técnicas',       icon: '📄' },
  { to: '/listado-proveedores',   label: 'Proveed. Críticos',     icon: '🏭' },
]

const adminLinks = [
  { to: '/especificaciones/nueva', label: 'Nueva ET',    icon: '⊕' },
  { to: '/usuarios',               label: 'Usuarios',    icon: '👥' },
]

export default function NavBar() {
  const { usuario, logout, tieneRol } = useAuth()
  const navigate = useNavigate()

  return (
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

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-800 truncate">{usuario?.nombre}</div>
        <div className="text-xs text-gray-500 truncate">{usuario?.email}</div>
        <div className="text-xs text-blue-600 mt-0.5 capitalize">{usuario?.rol?.replace(/_/g, ' ')}</div>
        <button onClick={() => { logout(); navigate('/login') }}
          className="mt-2 text-xs text-gray-500 hover:text-red-600 transition-colors">
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
