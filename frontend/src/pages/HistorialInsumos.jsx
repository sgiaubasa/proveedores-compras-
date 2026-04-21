import { useEffect, useState } from 'react'
import api from '../api'
import { BadgeNota, BadgeTrimestre } from '../components/Badge'
import { TRIM_LABELS } from '../utils/scoring'

const CRITERIOS = [
  { key: 'cotizacion',       label: 'Cotización',         ponderacion: 0.20 },
  { key: 'calidad_cantidad', label: 'Calidad y Cantidad',  ponderacion: 0.30 },
  { key: 'plazo_entrega',    label: 'Plazo de entrega',    ponderacion: 0.20 },
  { key: 'seriedad',         label: 'Seriedad',            ponderacion: 0.10 },
  { key: 'tiempo_respuesta', label: 'Tiempo de respuesta', ponderacion: 0.20 }
]

export default function HistorialInsumos() {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [loading, setLoading]           = useState(true)
  const [detalle, setDetalle]           = useState(null)

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

  useEffect(cargar, [])

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Historial — Insumos</h1>

      {/* Filtros */}
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

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando…</div>
        ) : evaluaciones.length === 0 ? (
          <div className="p-8 text-center text-gray-400 italic">No hay evaluaciones de insumos</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Proveedor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Insumo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Trimestre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Evaluador</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nota Final</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {evaluaciones.map(ev => (
                <tr key={ev._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{ev.proveedorNombre}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{ev.descripcionInsumo}</td>
                  <td className="px-4 py-3">
                    <BadgeTrimestre trimestre={ev.trimestre} />
                    <span className="text-xs text-gray-500 ml-1">{ev.anio}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{ev.userId?.nombre}</td>
                  <td className="px-4 py-3"><BadgeNota nota={ev.nota_final} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetalle(ev)} className="text-xs text-blue-600 hover:underline">Ver detalle</button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-200 flex justify-between">
              <div>
                <h2 className="text-lg font-bold">{detalle.proveedorNombre}</h2>
                <p className="text-sm text-gray-500">{detalle.descripcionInsumo} · {detalle.trimestre} {detalle.anio}</p>
              </div>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-4">
              <BadgeNota nota={detalle.nota_final} />
              {detalle.obs && <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">"{detalle.obs}"</p>}
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
                    const val = detalle[c.key]
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
                    <td className="px-3 py-2 text-center text-lg">{detalle.nota_final?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
