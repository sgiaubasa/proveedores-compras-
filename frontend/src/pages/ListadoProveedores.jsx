import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

const SECTORES = [
  'Gerencia de Recursos Humanos',
  'Gerencia de Compras',
  'Gerencia de Operaciones',
  'Subgerencia de Relaciones Institucionales',
  'Subgerencia de Seguridad Patrimonial',
  'Taller Mecánico (Gerencia de Mantenimiento)',
  'Gerencia Comercial',
  'Centro de Control y Monitoreo',
  'Asistencia Vial',
  'Gerencia de Sistemas',
  'Gerencia de Asuntos Legales',
  'Gerencia General',
  'Sistema de Gestión Integrado'
]

const ESTADO_LABELS = { A: 'Aprobado', D: 'Dudoso', E: 'Eliminado' }
const ESTADO_COLORS = {
  A: 'bg-green-100 text-green-700',
  D: 'bg-amber-100 text-amber-700',
  E: 'bg-red-100 text-red-600'
}

export default function ListadoProveedores() {
  const [datos, setDatos]         = useState([])   // docs guardados en mongo
  const [expandido, setExpandido] = useState(null)
  const { tieneRol }              = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => {
    api.get('/listado-proveedores').then(r => setDatos(r.data))
  }, [])

  const getDato = sector => datos.find(d => d.sector === sector) || null

  const formatFecha = iso => iso
    ? new Date(iso).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' })
    : null

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listado de Proveedores Críticos</h1>
          <p className="text-sm text-gray-500 mt-0.5">PAU/06-C · Anexo C · Rev. 02 — Un listado por sector</p>
        </div>
      </div>

      {/* Leyenda estados */}
      <div className="flex gap-3 mb-5 text-xs">
        {Object.entries(ESTADO_LABELS).map(([k, v]) => (
          <span key={k} className={`px-2.5 py-1 rounded-full font-medium ${ESTADO_COLORS[k]}`}>
            {k} = {v}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {SECTORES.map(sector => {
          const dato    = getDato(sector)
          const abierto = expandido === sector

          return (
            <div key={sector} className="bg-white border border-gray-200 rounded-xl overflow-hidden">

              {/* Cabecera */}
              <button
                onClick={() => setExpandido(abierto ? null : sector)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-800 text-sm">{sector}</span>
                  {dato ? (
                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {dato.servicios?.length || 0} servicios
                      </span>
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                        {dato.insumos?.length || 0} insumos
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full italic">Sin completar</span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {dato && (
                    <span className="text-xs text-gray-400">
                      Actualizado: {formatFecha(dato.updatedAt)}
                      {dato.updatedBy?.nombre ? ` · ${dato.updatedBy.nombre}` : ''}
                    </span>
                  )}
                  {tieneRol('admin', 'evaluador_compras') && (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/listado-proveedores/${encodeURIComponent(sector)}`) }}
                      className="px-2.5 py-1 text-xs border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-600">
                      {dato ? 'Editar' : 'Completar'}
                    </button>
                  )}
                  <span className="text-gray-400">{abierto ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Detalle expandido */}
              {abierto && (
                <div className="border-t border-gray-100 px-5 pb-5">
                  {!dato ? (
                    <div className="pt-4 text-sm text-gray-400 italic text-center py-6">
                      Este sector aún no tiene proveedores cargados.
                      {tieneRol('admin', 'evaluador_compras') && (
                        <span> <button onClick={() => navigate(`/listado-proveedores/${encodeURIComponent(sector)}`)}
                          className="text-blue-600 hover:underline">Completar ahora</button>.</span>
                      )}
                    </div>
                  ) : (
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Servicios */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-2">
                          Servicios críticos
                        </h3>
                        {dato.servicios?.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">N/A</p>
                        ) : (
                          <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-2 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Proveedor</th>
                                <th className="text-left px-2 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Servicio</th>
                                <th className="text-center px-2 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dato.servicios.map((s, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                  <td className="px-2 py-1.5 font-medium text-xs">{s.proveedor || '—'}</td>
                                  <td className="px-2 py-1.5 text-gray-600 text-xs">{s.servicio || '—'}</td>
                                  <td className="px-2 py-1.5 text-center">
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${ESTADO_COLORS[s.estado] || ''}`}>
                                      {s.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Insumos */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-orange-600 mb-2">
                          Insumos / Productos críticos
                        </h3>
                        {dato.insumos?.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">N/A</p>
                        ) : (
                          <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-2 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Proveedor</th>
                                <th className="text-left px-2 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Insumo</th>
                                <th className="text-center px-2 py-1.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dato.insumos.map((ins, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                  <td className="px-2 py-1.5 font-medium text-xs">{ins.proveedor || '—'}</td>
                                  <td className="px-2 py-1.5 text-gray-600 text-xs">{ins.insumo || '—'}</td>
                                  <td className="px-2 py-1.5 text-center">
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${ESTADO_COLORS[ins.estado] || ''}`}>
                                      {ins.estado}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Info pie */}
                      <div className="md:col-span-2 pt-1 text-xs text-gray-400 border-t border-gray-100 flex gap-6">
                        <span>Responsable: <strong className="text-gray-600">{dato.responsable || '—'}</strong></span>
                        <span>Última actualización: <strong className="text-gray-600">{formatFecha(dato.updatedAt)}</strong></span>
                        {dato.updatedBy?.nombre && <span>Por: <strong className="text-gray-600">{dato.updatedBy.nombre}</strong></span>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
