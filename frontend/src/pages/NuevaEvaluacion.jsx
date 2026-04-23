import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { TRIMESTRES, TRIM_LABELS, estadoNota } from '../utils/scoring'
import ScoreBar from '../components/ScoreBar'
import AreasSelector from '../components/AreasSelector'
import PuntajeSelector from '../components/PuntajeSelector'

export default function NuevaEvaluacion() {
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const { tieneRol, puedeEvaluar } = useAuth()

  const [ets, setEts]           = useState([])
  const [paso, setPaso]         = useState(1)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  const [etId, setEtId]           = useState(params.get('etId') || '')
  const [trimestre, setTrimestre] = useState('')
  const [anio, setAnio]           = useState(new Date().getFullYear())
  const [areas, setAreas]         = useState([])
  const [obs, setObs]             = useState('')

  const [etData, setEtData]     = useState(null)
  const [puntajes, setPuntajes] = useState({})
  const [obsItems, setObsItems] = useState({})

  useEffect(() => {
    api.get('/espec-tecnicas').then(r => {
      const todas = r.data
      setEts(tieneRol('admin') ? todas : todas.filter(et => puedeEvaluar(et._id)))
    })
  }, [])

  useEffect(() => {
    if (etId) api.get(`/espec-tecnicas/${etId}`).then(r => setEtData(r.data))
  }, [etId])

  const notaPreview = (() => {
    if (!etData) return null
    if (etData.items.some(it => puntajes[it.n] === undefined)) return null
    return etData.items.reduce((sum, it) => sum + (puntajes[it.n] * it.ponderacion), 0)
  })()

  const handlePaso1 = e => {
    e.preventDefault()
    if (!etId || !trimestre) return setError('Seleccioná la ET y el trimestre')
    setError(null)
    setPaso(2)
    setPuntajes({})
    setObsItems({})
  }

  const handleGuardar = async () => {
    const faltantes = etData.items.filter(it => puntajes[it.n] === undefined)
    if (faltantes.length) return setError(`Faltan puntuar ${faltantes.length} ítem(s)`)
    setSaving(true)
    setError(null)
    try {
      const items = etData.items.map(it => ({
        n:           it.n,
        desc:        it.descripcion,
        puntaje:     puntajes[it.n],
        ponderacion: it.ponderacion,
        obs:         obsItems[it.n] || ''
      }))
      await api.post('/evaluaciones', { etId, trimestre, anio, areas, obs, items })
      navigate('/historial')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const estado = notaPreview !== null ? estadoNota(notaPreview) : null

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Evaluación de Servicio</h1>

      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map(n => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${paso >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{n}</div>
            <span className={`text-sm ${paso >= n ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{n === 1 ? 'Datos generales' : 'Puntuación'}</span>
            {n < 2 && <div className={`w-8 h-0.5 ${paso > n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

      {/* PASO 1 */}
      {paso === 1 && (
        <form onSubmit={handlePaso1} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especificación Técnica *</label>
            <select value={etId} onChange={e => setEtId(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">Seleccionar ET…</option>
              {ets.map(et => <option key={et._id} value={et._id}>{et.codigo} — {et.nombre}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre *</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIMESTRES.map(t => (
                  <button key={t} type="button" onClick={() => setTrimestre(t)}
                    className={`py-2 text-sm rounded-lg border font-medium transition-colors ${trimestre === t ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
              {trimestre && <p className="text-xs text-gray-500 mt-1">{TRIM_LABELS[trimestre]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
              <input type="number" value={anio} onChange={e => setAnio(Number(e.target.value))}
                min="2020" max="2099" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área(s) evaluadora(s)
              {areas.length > 0 && <span className="ml-2 text-xs text-blue-600 font-normal">{areas.join(' + ')}</span>}
            </label>
            <AreasSelector value={areas} onChange={setAreas} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              Continuar →
            </button>
          </div>
        </form>
      )}

      {/* PASO 2 — Puntuación */}
      {paso === 2 && etData && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-blue-800">{etData.codigo}</span>
                <span className="text-blue-700 ml-2 font-medium">{etData.nombre}</span>
                <p className="text-sm text-blue-600 mt-0.5">{TRIM_LABELS[trimestre]} · {anio}</p>
                {areas.length > 0 && (
                  <p className="text-xs text-blue-500 mt-0.5">Áreas: {areas.join(' + ')}</p>
                )}
              </div>
              {notaPreview !== null && (
                <div className="text-right">
                  <div className={`text-2xl font-bold ${estado?.color === 'green' ? 'text-green-600' : estado?.color === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
                    {notaPreview.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-600">{estado?.label}</div>
                </div>
              )}
            </div>
            {notaPreview !== null && <div className="mt-3"><ScoreBar nota={notaPreview} /></div>}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs text-gray-600 flex gap-4 flex-wrap">
            <span>📌 <strong>1</strong> = Muy deficiente</span>
            <span><strong>2</strong> = Deficiente</span>
            <span><strong>3</strong> = Regular</span>
            <span><strong>4</strong> = Bueno</span>
            <span><strong>5</strong> = Excelente</span>
            <span className="text-blue-600">· También podés escribir decimales (ej: 4.5)</span>
          </div>

          {etData.items.map(item => (
            <div key={item.n} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold flex items-center justify-center">{item.n}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.descripcion}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.criterio}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  Pond. {(item.ponderacion * 100).toFixed(0)}%
                </span>
              </div>

              <div className="ml-10 space-y-1">
                <PuntajeSelector valor={puntajes[item.n]} onChange={v => setPuntajes(p => ({...p, [item.n]: v}))} />
                {puntajes[item.n] !== undefined && (
                  <p className="text-xs text-gray-500">
                    Puntaje: <strong>{puntajes[item.n]}</strong> · Subtotal: <strong>{(puntajes[item.n] * item.ponderacion).toFixed(2)}</strong>
                  </p>
                )}
              </div>

              <div className="ml-10">
                <input type="text" placeholder="Observación del ítem (opcional)…" value={obsItems[item.n] || ''}
                  onChange={e => setObsItems(o => ({...o, [item.n]: e.target.value}))}
                  className="w-full text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-2">
            <button onClick={() => setPaso(1)}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
              ← Volver
            </button>
            <button onClick={handleGuardar} disabled={saving}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar evaluación'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
