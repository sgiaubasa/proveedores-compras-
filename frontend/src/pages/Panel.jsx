import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import ScoreBar from '../components/ScoreBar'
import { BadgeNota } from '../components/Badge'
import { estadoNota } from '../utils/scoring'

export default function Panel() {
  const [todasEts, setTodasEts] = useState([])
  const [ultimaEval, setUltimaEval] = useState({})   // { etId → evaluacion }
  const [loading, setLoading]   = useState(true)
  const { usuario, tieneRol, puedeEvaluar } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/espec-tecnicas'),
      api.get('/evaluaciones')
    ]).then(([rEts, rEvs]) => {
      setTodasEts(rEts.data)
      const map = {}
      rEvs.data.forEach(ev => {
        const id = ev.etId?._id
        if (!id) return
        if (!map[id] || ev.anio > map[id].anio ||
            (ev.anio === map[id].anio && ev.trimestre > map[id].trimestre)) {
          map[id] = ev
        }
      })
      setUltimaEval(map)
    }).finally(() => setLoading(false))
  }, [])

  const ets = tieneRol('admin')
    ? todasEts
    : todasEts.filter(et => puedeEvaluar(et._id))

  const total     = ets.length
  const evaluadas = ets.filter(e => ultimaEval[e._id]).length
  const noCalif   = ets.filter(e => ultimaEval[e._id]?.nota_final < 3).length
  const puedeCargar = tieneRol('admin','evaluador_tecnico','evaluador_compras')

  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Proveedores Críticos</h1>
        {puedeCargar && (
          <div className="flex gap-2">
            <button onClick={() => navigate('/evaluacion')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
              + Evaluar Servicio
            </button>
            <button onClick={() => navigate('/evaluacion-insumo')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg">
              + Evaluar Insumo
            </button>
          </div>
        )}
      </div>

      {!tieneRol('admin') && ets.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-800 text-sm">
          <strong>Sin proveedores asignados.</strong> Contactá al administrador.
        </div>
      )}

      {ets.length > 0 && (
        <>
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Metrica valor={total}    label="Servicios / ETs"  color="blue" />
            <Metrica valor={evaluadas} label="Evaluadas"       color="green" />
            <Metrica valor={noCalif}  label="No califican"     color="red" />
          </div>

          {/* Criterio de estado */}
          <div className="flex gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/> ≥ 4.0 Conforme</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"/> 3.0–3.9 Con seguimiento</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/> &lt; 3.0 No califica</span>
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Código</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Servicio / Proveedor</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Área técnica</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Última eval.</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-48">Nota</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  {puedeCargar && <th className="px-4 py-3 w-24"></th>}
                </tr>
              </thead>
              <tbody>
                {ets.map(et => {
                  const ultima = ultimaEval[et._id]
                  const { label, color } = estadoNota(ultima?.nota_final)
                  return (
                    <tr key={et._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-700 font-bold">{et.codigo}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{et.nombre}</div>
                        <div className="text-xs text-gray-500">{et.proveedorNombre}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{et.area_tecnica}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {ultima ? `${ultima.trimestre} ${ultima.anio}` : <span className="text-gray-400 italic">Sin evaluar</span>}
                      </td>
                      <td className="px-4 py-3 w-48">
                        <ScoreBar nota={ultima?.nota_final} />
                      </td>
                      <td className="px-4 py-3">
                        <BadgeNota nota={ultima?.nota_final} />
                      </td>
                      {puedeCargar && (
                        <td className="px-4 py-3">
                          <button onClick={() => navigate(`/evaluacion?etId=${et._id}`)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">
                            Evaluar
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function Metrica({ valor, label, color }) {
  const cls = { blue:'text-blue-700', green:'text-green-600', red:'text-red-600' }[color]
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className={`text-3xl font-bold ${cls}`}>{valor}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}
