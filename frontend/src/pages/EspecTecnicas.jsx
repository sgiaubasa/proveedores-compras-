import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function EspecTecnicas() {
  const [ets, setEts]             = useState([])
  const [expandida, setExpandida] = useState(null)
  const [historial, setHistorial] = useState(null)  // modal historial revisiones
  const { tieneRol }              = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => {
    api.get('/espec-tecnicas').then(r => setEts(r.data))
  }, [])

  const verHistorial = async codigo => {
    const r = await api.get(`/espec-tecnicas/historial/${codigo}`)
    setHistorial({ codigo, revisiones: r.data })
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Especificaciones Técnicas</h1>
        {tieneRol('admin') && (
          <button onClick={() => navigate('/especificaciones/nueva')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
            + Nueva ET
          </button>
        )}
      </div>

      <div className="space-y-3">
        {ets.map(et => (
          <div key={et._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <button onClick={() => setExpandida(expandida === et._id ? null : et._id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-4">
                <span className="font-mono text-blue-700 font-bold text-sm">{et.codigo}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Rev. {et.revision}</span>
                <div>
                  <div className="font-semibold text-gray-900">{et.nombre}</div>
                  <div className="text-xs text-gray-500">{et.proveedorNombre} · {et.area_tecnica} · {et.frecuencia}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {tieneRol('admin') && (
                  <>
                    <button onClick={e => { e.stopPropagation(); navigate(`/especificaciones/editar/${et._id}`) }}
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600">
                      Editar
                    </button>
                    <button onClick={e => { e.stopPropagation(); navigate(`/especificaciones/revision/${et._id}`) }}
                      className="px-2.5 py-1 text-xs border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-600">
                      + Revisión
                    </button>
                    <button onClick={e => { e.stopPropagation(); verHistorial(et.codigo) }}
                      className="px-2.5 py-1 text-xs border border-teal-300 rounded-lg hover:bg-teal-50 text-teal-600">
                      Historial
                    </button>
                  </>
                )}
                <span className="text-gray-400 ml-1">{expandida === et._id ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Detalle expandido */}
            {expandida === et._id && (
              <div className="px-5 pb-5 border-t border-gray-100">
                <table className="w-full text-sm mt-3 border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-gray-600 font-semibold border-b border-gray-200 w-8">N°</th>
                      <th className="text-left px-3 py-2 text-gray-600 font-semibold border-b border-gray-200">Factor</th>
                      <th className="text-left px-3 py-2 text-gray-600 font-semibold border-b border-gray-200">Criterio</th>
                      <th className="text-center px-3 py-2 text-gray-600 font-semibold border-b border-gray-200 w-16">Pond.</th>
                      <th className="text-left px-3 py-2 text-gray-600 font-semibold border-b border-gray-200">Compras</th>
                      <th className="text-left px-3 py-2 text-gray-600 font-semibold border-b border-gray-200">Área técnica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {et.items.map(it => (
                      <tr key={it.n} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-500 font-mono">{it.n}</td>
                        <td className="px-3 py-2 font-medium">{it.descripcion}</td>
                        <td className="px-3 py-2 text-gray-600 text-xs">{it.criterio}</td>
                        <td className="px-3 py-2 text-center font-semibold text-blue-700">{(it.ponderacion*100).toFixed(0)}%</td>
                        <td className="px-3 py-2 text-xs">
                          {it.resp_compras.map(f => <FaseBadge key={f} fase={f} tipo="compras" />)}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {it.resp_tecnica.map(f => <FaseBadge key={f} fase={f} tipo="tecnica" />)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50">
                      <td colSpan={3} className="px-3 py-1.5 text-right text-xs font-semibold text-blue-700">Total ponderación:</td>
                      <td className="px-3 py-1.5 text-center text-xs font-bold text-blue-700">
                        {(et.items.reduce((s, i) => s + i.ponderacion, 0) * 100).toFixed(0)}%
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal historial de revisiones */}
      {historial && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-gray-200 flex justify-between">
              <h2 className="text-lg font-bold">Historial de revisiones — {historial.codigo}</h2>
              <button onClick={() => setHistorial(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-3">
              {historial.revisiones.map(rev => (
                <div key={rev._id} className={`flex items-center justify-between p-3 rounded-lg border ${rev.esVigente ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <div>
                    <span className="font-semibold text-gray-800">Rev. {rev.revision}</span>
                    <span className="text-xs text-gray-500 ml-2">{new Date(rev.createdAt).toLocaleDateString('es-AR')}</span>
                    {rev.creadoPor && <span className="text-xs text-gray-400 ml-2">por {rev.creadoPor.nombre}</span>}
                  </div>
                  {rev.esVigente
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Vigente</span>
                    : <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Histórica</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const FASE_LABELS = { i:'Inicial', a:'Anual', d:'Desempeño', ins:'Inspección' }
function FaseBadge({ fase, tipo }) {
  const cls = tipo === 'compras' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
  return <span className={`inline-block mr-1 px-1.5 py-0.5 rounded ${cls}`}>{FASE_LABELS[fase]}</span>
}
