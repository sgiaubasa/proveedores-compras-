import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { BadgeNota, BadgeTrimestre } from '../components/Badge'
import { TRIM_LABELS, TRIMESTRES } from '../utils/scoring'
import AreasSelector from '../components/AreasSelector'
import PuntajeSelector from '../components/PuntajeSelector'

export default function Historial() {
  const { tieneRol } = useAuth()
  const [evaluaciones, setEvaluaciones] = useState([])
  const [ets, setEts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [detalle, setDetalle] = useState(null)
  const [resumen, setResumen] = useState(null)
  const [editando, setEditando] = useState(null)   // evaluación en edición

  const [filtroEt, setFiltroEt]     = useState('')
  const [filtroTrim, setFiltroTrim] = useState('')
  const [filtroAnio, setFiltroAnio] = useState('')

  const cargar = () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filtroEt)   q.set('etId',     filtroEt)
    if (filtroTrim) q.set('trimestre', filtroTrim)
    if (filtroAnio) q.set('anio',      filtroAnio)
    api.get(`/evaluaciones?${q}`).then(r => setEvaluaciones(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/espec-tecnicas').then(r => setEts(r.data))
    cargar()
  }, [])

  const verResumenAnual = async (etId, anio) => {
    const r = await api.get(`/evaluaciones/resumen-anual/${etId}/${anio}`)
    const et = ets.find(e => e._id === etId)
    setResumen({ ...r.data, etNombre: et?.nombre, etCodigo: et?.codigo })
  }

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Historial — Servicios</h1>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">ET</label>
          <select value={filtroEt} onChange={e => setFiltroEt(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300">
            <option value="">Todas</option>
            {ets.map(et => <option key={et._id} value={et._id}>{et.codigo}</option>)}
          </select>
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
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
          Filtrar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando…</div>
        ) : evaluaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-400 italic">No hay evaluaciones registradas</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ET</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Trimestre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Áreas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Evaluador</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nota Final</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map(ev => (
                <tr key={ev._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-blue-700 font-bold">{ev.etId?.codigo}</span>
                    <div className="text-xs text-gray-500 truncate max-w-[140px]">{ev.etId?.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <BadgeTrimestre trimestre={ev.trimestre} />
                    <span className="text-xs text-gray-500 ml-1">{ev.anio}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {(ev.areas?.length ? ev.areas : ev.area ? [ev.area] : []).join(' + ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{ev.userId?.nombre}</td>
                  <td className="px-4 py-3"><BadgeNota nota={ev.nota_final} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setDetalle(ev)} className="text-xs text-blue-600 hover:underline">Detalle</button>
                      <button onClick={() => verResumenAnual(ev.etId?._id, ev.anio)} className="text-xs text-teal-600 hover:underline">Anual</button>
                      {tieneRol('admin') && (
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

      {/* Modal detalle */}
      {detalle && (
        <ModalDetalle ev={detalle} onClose={() => setDetalle(null)} />
      )}

      {/* Modal editar (solo admin) */}
      {editando && (
        <ModalEditarServicio
          ev={editando}
          onClose={() => setEditando(null)}
          onGuardado={evActualizado => {
            setEvaluaciones(prev => prev.map(e => e._id === evActualizado._id ? evActualizado : e))
            setEditando(null)
          }}
        />
      )}

      {/* Modal resumen anual */}
      {resumen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-200 flex justify-between">
              <div>
                <h2 className="text-lg font-bold">Resumen Anual {resumen.anio}</h2>
                <p className="text-sm text-gray-500">{resumen.etCodigo} — {resumen.etNombre}</p>
              </div>
              <button onClick={() => setResumen(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {['1T','2T','3T','4T'].map(t => (
                  <div key={t} className="text-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">{t}</div>
                    <div className={`text-xl font-bold ${resumen.porTrimestre[t] !== null ? (resumen.porTrimestre[t] >= 4 ? 'text-green-600' : resumen.porTrimestre[t] >= 3 ? 'text-amber-600' : 'text-red-600') : 'text-gray-300'}`}>
                      {resumen.porTrimestre[t] !== null ? resumen.porTrimestre[t]?.toFixed(2) : '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-xs text-blue-600 mb-1 uppercase tracking-wide">Promedio Anual</div>
                <div className={`text-4xl font-bold ${resumen.promedio_anual >= 4 ? 'text-green-600' : resumen.promedio_anual >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                  {resumen.promedio_anual !== null ? resumen.promedio_anual.toFixed(2) : '—'}
                </div>
                <BadgeNota nota={resumen.promedio_anual} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Modal detalle (solo lectura) ──────────────────────────────
function ModalDetalle({ ev, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold">{ev.etId?.codigo} · {ev.trimestre} {ev.anio}</h2>
            <p className="text-sm text-gray-500">
              {ev.etId?.nombre} · {(ev.areas?.length ? ev.areas : ev.area ? [ev.area] : []).join(' + ') || '—'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <BadgeNota nota={ev.nota_final} />
            <span className="text-xs text-gray-500">Evaluado por: {ev.userId?.nombre}</span>
          </div>
          {ev.obs && <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">"{ev.obs}"</p>}
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">N°</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Ítem</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Pond.</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Puntaje</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Subtotal</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 border-b border-gray-200">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {ev.items.map(it => (
                <tr key={it.n} className="border-b border-gray-100">
                  <td className="px-3 py-2 text-gray-500">{it.n}</td>
                  <td className="px-3 py-2">{it.desc}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{(it.ponderacion*100).toFixed(0)}%</td>
                  <td className="px-3 py-2 text-center font-bold">
                    <span className={it.puntaje >= 4 ? 'text-green-600' : it.puntaje >= 3 ? 'text-amber-600' : 'text-red-600'}>
                      {it.puntaje}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">{(it.puntaje * it.ponderacion).toFixed(2)}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{it.obs || '—'}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={4} className="px-3 py-2 text-right text-gray-700">NOTA FINAL</td>
                <td className="px-3 py-2 text-center text-lg">{ev.nota_final?.toFixed(2)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Modal editar servicio (solo admin) ────────────────────────
function ModalEditarServicio({ ev, onClose, onGuardado }) {
  const [trimestre, setTrimestre] = useState(ev.trimestre)
  const [anio, setAnio]           = useState(ev.anio)
  const [areas, setAreas]         = useState(ev.areas?.length ? ev.areas : ev.area ? [ev.area] : [])
  const [obs, setObs]             = useState(ev.obs || '')
  const [puntajes, setPuntajes]   = useState(Object.fromEntries(ev.items.map(it => [it.n, it.puntaje])))
  const [obsItems, setObsItems]   = useState(Object.fromEntries(ev.items.map(it => [it.n, it.obs || ''])))
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  const notaPreview = ev.items.every(it => puntajes[it.n] !== undefined)
    ? ev.items.reduce((s, it) => s + puntajes[it.n] * it.ponderacion, 0)
    : null

  const handleGuardar = async () => {
    const faltantes = ev.items.filter(it => puntajes[it.n] === undefined)
    if (faltantes.length) return setError(`Faltan puntuar ${faltantes.length} ítem(s)`)
    setSaving(true)
    setError(null)
    try {
      const items = ev.items.map(it => ({
        n: it.n, desc: it.desc,
        puntaje: puntajes[it.n],
        ponderacion: it.ponderacion,
        obs: obsItems[it.n] || ''
      }))
      const r = await api.put(`/evaluaciones/${ev._id}`, { trimestre, anio, areas, obs, items })
      onGuardado({ ...ev, ...r.data })
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-200 flex justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-orange-700">✏️ Editar evaluación</h2>
            <p className="text-sm text-gray-500">{ev.etId?.codigo} — {ev.etId?.nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

          {/* Trimestre + Año */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
              <div className="grid grid-cols-4 gap-1">
                {TRIMESTRES.map(t => (
                  <button key={t} type="button" onClick={() => setTrimestre(t)}
                    className={`py-1.5 text-sm rounded-lg border font-medium transition-colors ${trimestre === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
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

          {/* Áreas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área(s) evaluadora(s)</label>
            <AreasSelector value={areas} onChange={setAreas} />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>

          {/* Ítems */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Puntajes por ítem</h3>
              {notaPreview !== null && (
                <span className={`text-sm font-bold ${notaPreview >= 4 ? 'text-green-600' : notaPreview >= 3 ? 'text-amber-600' : 'text-red-600'}`}>
                  Nota: {notaPreview.toFixed(2)}
                </span>
              )}
            </div>
            {ev.items.map(it => (
              <div key={it.n} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-xs text-gray-400 mr-1">#{it.n}</span>
                    <span className="text-sm font-medium">{it.desc}</span>
                    <span className="ml-2 text-xs text-gray-400">({(it.ponderacion*100).toFixed(0)}%)</span>
                  </div>
                  {puntajes[it.n] !== undefined && (
                    <span className="text-xs text-gray-500 shrink-0">
                      Sub: {(puntajes[it.n] * it.ponderacion).toFixed(2)}
                    </span>
                  )}
                </div>
                <PuntajeSelector size="sm" valor={puntajes[it.n]} onChange={v => setPuntajes(p => ({...p, [it.n]: v}))} />
                <input type="text" placeholder="Observación del ítem…" value={obsItems[it.n] || ''}
                  onChange={e => setObsItems(o => ({...o, [it.n]: e.target.value}))}
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            ))}
          </div>
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
