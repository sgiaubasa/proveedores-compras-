import { useEffect, useState } from 'react'
import api from '../api'
import { BadgeNota, BadgeTrimestre } from '../components/Badge'
import { TRIM_LABELS } from '../utils/scoring'

export default function Historial() {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [ets, setEts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [detalle, setDetalle] = useState(null)
  const [resumen, setResumen] = useState(null)

  const [filtroEt, setFiltroEt]     = useState('')
  const [filtroTrim, setFiltroTrim] = useState('')
  const [filtroAnio, setFiltroAnio] = useState('')
  const [filtroArea, setFiltroArea] = useState('')

  const cargar = () => {
    setLoading(true)
    const q = new URLSearchParams()
    if (filtroEt)   q.set('etId',     filtroEt)
    if (filtroTrim) q.set('trimestre', filtroTrim)
    if (filtroAnio) q.set('anio',      filtroAnio)
    if (filtroArea) q.set('area',      filtroArea)
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
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Área</label>
          <select value={filtroArea} onChange={e => setFiltroArea(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300">
            <option value="">Todas</option>
            {['GO','GC','CAE','Compras','SAV','JAV','CCM','SGI'].map(a => <option key={a}>{a}</option>)}
          </select>
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Área</th>
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
                  <td className="px-4 py-3 text-gray-600">{ev.area || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{ev.userId?.nombre}</td>
                  <td className="px-4 py-3"><BadgeNota nota={ev.nota_final} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => setDetalle(ev)} className="text-xs text-blue-600 hover:underline">Ver detalle</button>
                    <button onClick={() => verResumenAnual(ev.etId?._id, ev.anio)} className="text-xs text-teal-600 hover:underline">Anual</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-bold">{detalle.etId?.codigo} · {detalle.trimestre} {detalle.anio}</h2>
                <p className="text-sm text-gray-500">{detalle.etId?.nombre} · {detalle.area}</p>
              </div>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <BadgeNota nota={detalle.nota_final} />
                <span className="text-xs text-gray-500">Evaluado por: {detalle.userId?.nombre}</span>
              </div>
              {detalle.obs && <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">"{detalle.obs}"</p>}
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
                  {detalle.items.map(it => (
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
                    <td className="px-3 py-2 text-center text-lg">{detalle.nota_final?.toFixed(2)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
              <p className="text-xs text-gray-500 text-center">Criterio: 4–5 Conforme · 3–4 Con seguimiento · 1–3 No califica</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
