import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { BadgeNota, BadgeTrimestre } from '../components/Badge'
import { TRIMESTRES, clasificacionABC, ACCION_TIPOS, ACCION_ESTADOS } from '../utils/scoring'
import AreasSelector from '../components/AreasSelector'
import PuntajeSelector from '../components/PuntajeSelector'

const CRITERIOS = [
  { key: 'cotizacion',       label: 'Cotización',          ponderacion: 0.20 },
  { key: 'calidad_cantidad', label: 'Calidad y Cantidad',   ponderacion: 0.30 },
  { key: 'plazo_entrega',    label: 'Plazo de entrega',     ponderacion: 0.20 },
  { key: 'seriedad',         label: 'Seriedad',             ponderacion: 0.10 },
  { key: 'tiempo_respuesta', label: 'Tiempo de respuesta',  ponderacion: 0.20 }
]

export default function HistorialInsumos() {
  const { tieneRol, usuario } = useAuth()
  const [evaluaciones, setEvaluaciones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [detalle, setDetalle] = useState(null)
  const [editando, setEditando] = useState(null)

  const puedeEditar = ev => {
    if (tieneRol('admin')) return true
    const evAreas  = ev.areas?.length ? ev.areas : ev.area ? [ev.area] : []
    return (usuario?.sectores || []).some(s => evAreas.includes(s))
  }

  const evaluacionesVisibles = tieneRol('admin')
    ? evaluaciones
    : evaluaciones.filter(ev => {
        const evAreas = ev.areas?.length ? ev.areas : ev.area ? [ev.area] : []
        return (usuario?.sectores || []).some(s => evAreas.includes(s))
      })

  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroTrim, setFiltroTrim]           = useState('')
  const [filtroAnio, setFiltroAnio]           = useState('')

  const cargar = () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filtroProveedor) q.set('proveedor', filtroProveedor)
    if (filtroTrim)      q.set('trimestre', filtroTrim)
    if (filtroAnio)      q.set('anio',      filtroAnio)
    api.get(`/evaluaciones-insumo?${q}`).then(r => setEvaluaciones(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
    if (tieneRol('admin')) api.get('/usuarios').then(r => setUsuarios(r.data))
  }, [])

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Historial — Insumos</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Proveedor</label>
          <input value={filtroProveedor} onChange={e => setFiltroProveedor(e.target.value)} placeholder="Buscar…"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 w-36" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Trimestre</label>
          <select value={filtroTrim} onChange={e => setFiltroTrim(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300">
            <option value="">Todos</option>
            {['1T','2T','3T','4T'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Año</label>
          <input type="number" value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)}
            placeholder="2025" min="2020" max="2099"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-blue-300" />
        </div>
        <button onClick={cargar}
          className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg">
          Filtrar
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando…</div>
        ) : evaluacionesVisibles.length === 0 ? (
          <div className="p-8 text-center text-gray-400 italic">
            {evaluaciones.length === 0
              ? 'No hay evaluaciones de insumos'
              : 'No hay evaluaciones de insumos para tu sector asignado'}
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Proveedor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Insumo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Trimestre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Áreas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Evaluador</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Entreg.</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nota / Clasif.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {evaluacionesVisibles.map(ev => (
                <tr key={ev._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{ev.proveedorNombre}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{ev.descripcionInsumo}</td>
                  <td className="px-4 py-3">
                    <BadgeTrimestre trimestre={ev.trimestre} />
                    <span className="text-xs text-gray-500 ml-1">{ev.anio}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {(ev.areas?.length ? ev.areas : ev.area ? [ev.area] : []).join(' + ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-gray-800">{ev.userId?.nombre || '—'}</div>
                    {ev.userId?.area && <div className="text-gray-400">{ev.userId.area}</div>}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    {ev.cantidadPrestaciones || 1}
                  </td>
                  <td className="px-4 py-3">
                    <BadgeNota nota={ev.nota_final} />
                    {(() => { const c = clasificacionABC(ev.nota_final); return c ? (
                      <span className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-bold ${c.cls}`}>
                        {c.letra} · {c.label}
                      </span>
                    ) : null })()}
                    {ev.accion?.tipo && (
                      <div className="mt-1 text-xs text-red-600 font-medium">📋 Acción documentada</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setDetalle(ev)} className="text-xs text-blue-600 hover:underline">Detalle</button>
                      {puedeEditar(ev) && (
                        <button onClick={() => setEditando(ev)} className="text-xs text-orange-600 hover:underline font-semibold">Editar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detalle && <ModalDetalle ev={detalle} onClose={() => setDetalle(null)} />}

      {editando && (
        <ModalEditarInsumo
          ev={editando}
          usuarios={usuarios}
          esAdmin={tieneRol('admin')}
          onClose={() => setEditando(null)}
          onGuardado={evActualizado => {
            setEvaluaciones(prev => prev.map(e => e._id === evActualizado._id ? evActualizado : e))
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}

function ModalDetalle({ ev, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-5 border-b border-gray-200 flex justify-between">
          <div>
            <h2 className="text-lg font-bold">{ev.proveedorNombre}</h2>
            <p className="text-sm text-gray-500">
              {ev.descripcionInsumo} · {ev.trimestre} {ev.anio}
              {(ev.areas?.length ? ev.areas : ev.area ? [ev.area] : []).length > 0 &&
                ` · ${(ev.areas?.length ? ev.areas : [ev.area]).join(' + ')}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BadgeNota nota={ev.nota_final} />
              {(() => { const c = clasificacionABC(ev.nota_final); return c ? (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-sm font-bold ${c.cls}`}>
                  Clasificación {c.letra} — {c.label}
                </span>
              ) : null })()}
            </div>
            <div className="text-xs text-gray-500 text-right">
              {ev.cantidadPrestaciones || 1} entrega(s) en el período
            </div>
          </div>
          {ev.obs && <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">"{ev.obs}"</p>}
          {ev.accion?.tipo && (
            <div className="border border-red-200 bg-red-50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                <span>📋</span>
                <span>Acción documentada — {ACCION_TIPOS.find(t => t.value === ev.accion.tipo)?.label}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${ev.accion.estado === 'cerrada' ? 'bg-green-100 text-green-700' : ev.accion.estado === 'en_curso' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ACCION_ESTADOS.find(e => e.value === ev.accion.estado)?.label || ev.accion.estado}
                </span>
              </div>
              {ev.accion.descripcion && <p className="text-xs text-red-700">{ev.accion.descripcion}</p>}
              <div className="flex gap-4 text-xs text-gray-500">
                {ev.accion.responsable && <span>Responsable: <strong>{ev.accion.responsable}</strong></span>}
                {ev.accion.fechaImpl && <span>Fecha impl.: <strong>{new Date(ev.accion.fechaImpl).toLocaleDateString('es-AR')}</strong></span>}
              </div>
            </div>
          )}
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Criterio</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Pond.</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Puntaje</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIOS.map(c => {
                const val = ev[c.key]
                return (
                  <tr key={c.key} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium">{c.label}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{(c.ponderacion*100).toFixed(0)}%</td>
                    <td className="px-3 py-2 text-center font-bold">
                      <span className={val?.puntaje >= 4 ? 'text-green-600' : val?.puntaje >= 3 ? 'text-amber-600' : 'text-red-600'}>
                        {val?.puntaje ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">
                      {val ? (val.puntaje * val.ponderacion).toFixed(2) : '—'}
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="px-3 py-2 text-right text-gray-700">NOTA FINAL</td>
                <td className="px-3 py-2 text-center text-lg">{ev.nota_final?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ModalEditarInsumo({ ev, onClose, onGuardado, usuarios = [], esAdmin = false }) {
  const [trimestre, setTrimestre] = useState(ev.trimestre)
  const [anio, setAnio]           = useState(ev.anio)
  const [areas, setAreas]         = useState(ev.areas?.length ? ev.areas : ev.area ? [ev.area] : [])
  const [obs, setObs]             = useState(ev.obs || '')
  const [userId, setUserId]       = useState(ev.userId?._id || ev.userId || '')
  const [cantidadPrestaciones, setCantidadPrestaciones] = useState(ev.cantidadPrestaciones || 1)
  const [accion, setAccion]       = useState(ev.accion || { tipo: '', descripcion: '', fechaImpl: '', responsable: '', estado: 'pendiente' })
  const [puntajes, setPuntajes]   = useState(
    Object.fromEntries(CRITERIOS.map(c => [c.key, ev[c.key]?.puntaje]))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const notaPreview = CRITERIOS.every(c => puntajes[c.key] !== undefined)
    ? CRITERIOS.reduce((s, c) => s + puntajes[c.key] * c.ponderacion, 0)
    : null

  const handleGuardar = async () => {
    const faltantes = CRITERIOS.filter(c => puntajes[c.key] === undefined)
    if (faltantes.length) return setError(`Falta puntuar: ${faltantes.map(c => c.label).join(', ')}`)
    setSaving(true)
    setError(null)
    try {
      const payload = { trimestre, anio, areas, obs, cantidadPrestaciones }
      CRITERIOS.forEach(c => {
        payload[c.key] = { puntaje: puntajes[c.key], ponderacion: c.ponderacion }
      })
      if (accion.tipo) payload.accion = accion
      if (esAdmin && userId) payload.userId = userId
      const r = await api.put(`/evaluaciones-insumo/${ev._id}`, payload)
      onGuardado({ ...ev, ...r.data })
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-orange-700">✏️ Editar evaluación de insumo</h2>
            <p className="text-sm text-gray-500">{ev.proveedorNombre} — {ev.descripcionInsumo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

          {/* Evaluador — solo admin */}
          {esAdmin && usuarios.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluador</label>
              <select value={userId} onChange={e => setUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">— Sin cambiar —</option>
                {usuarios.filter(u => u.activo).map(u => (
                  <option key={u._id} value={u._id}>
                    {u.nombre}{u.area ? ` — ${u.area}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
              <div className="grid grid-cols-4 gap-1">
                {TRIMESTRES.map(t => (
                  <button key={t} type="button" onClick={() => setTrimestre(t)}
                    className={`py-1.5 text-sm rounded-lg border font-medium transition-colors ${trimestre === t ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-700 hover:border-orange-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input type="number" value={anio} onChange={e => setAnio(Number(e.target.value))} min="2020" max="2099"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área(s) evaluadora(s)</label>
            <AreasSelector value={areas} onChange={setAreas} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Criterios</h3>
              {notaPreview !== null && (
                <span className={`text-sm font-bold ${notaPreview >= 4 ? 'text-green-600' : notaPreview >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                  Nota: {notaPreview.toFixed(2)}
                </span>
              )}
            </div>
            {CRITERIOS.map(c => (
              <div key={c.key} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{c.label}</span>
                  <span className="text-xs text-gray-400">
                    {(c.ponderacion*100).toFixed(0)}%
                    {puntajes[c.key] !== undefined && ` · Sub: ${(puntajes[c.key] * c.ponderacion).toFixed(2)}`}
                  </span>
                </div>
                <PuntajeSelector size="sm" valor={puntajes[c.key]} onChange={v => setPuntajes(p => ({...p, [c.key]: v}))} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entregas recibidas en el período
              <span className="ml-1 text-xs text-gray-400 font-normal">(cantidad de veces que entregó el insumo)</span>
            </label>
            <input type="number" value={cantidadPrestaciones}
              onChange={e => setCantidadPrestaciones(Math.max(1, Number(e.target.value)))}
              min="1" step="1"
              className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          {/* Acción documentada */}
          {(notaPreview !== null && notaPreview < 3 || accion.tipo) && (
            <div className={`border-2 rounded-xl p-4 space-y-3 ${notaPreview !== null && notaPreview < 3 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span>{notaPreview !== null && notaPreview < 3 ? '⚠️' : '📋'}</span>
                <h3 className={`text-sm font-semibold ${notaPreview !== null && notaPreview < 3 ? 'text-red-800' : 'text-gray-700'}`}>
                  Acción documentada {notaPreview !== null && notaPreview < 3 ? '— requerida por Clasificación C' : ''}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {ACCION_TIPOS.map(t => (
                  <button key={t.value} type="button" onClick={() => setAccion(a => ({ ...a, tipo: t.value }))}
                    className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${accion.tipo === t.value ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-700 hover:border-red-400'}`}>
                    {t.label}
                  </button>
                ))}
                {accion.tipo && <button type="button" onClick={() => setAccion(a => ({ ...a, tipo: '' }))}
                  className="text-xs text-gray-400 hover:text-gray-600">✕ quitar</button>}
              </div>
              {accion.tipo && (
                <>
                  <textarea value={accion.descripcion || ''} onChange={e => setAccion(a => ({ ...a, descripcion: e.target.value }))}
                    rows={2} placeholder="Descripción de la acción…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-300 resize-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Responsable</label>
                      <input type="text" value={accion.responsable || ''} onChange={e => setAccion(a => ({ ...a, responsable: e.target.value }))}
                        placeholder="Nombre o área…"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-300" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha de implementación</label>
                      <input type="date" value={accion.fechaImpl ? accion.fechaImpl.substring(0,10) : ''} onChange={e => setAccion(a => ({ ...a, fechaImpl: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-300" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ACCION_ESTADOS.map(s => (
                      <button key={s.value} type="button" onClick={() => setAccion(a => ({ ...a, estado: s.value }))}
                        className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${accion.estado === s.value ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
            Cancelar
          </button>
          <button onClick={handleGuardar} disabled={saving}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-sm disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
