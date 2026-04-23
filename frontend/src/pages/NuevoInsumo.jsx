import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { TRIMESTRES, TRIM_LABELS, estadoNota } from '../utils/scoring'
import ScoreBar from '../components/ScoreBar'

const AREAS = ['Compras','Área Técnica','GO','GC','CAE','SAV','JAV','CCM','SGI','Otro']

const CRITERIOS = [
  { key: 'cotizacion',       label: 'Cotización',          ponderacion: 0.20, desc: 'Precio competitivo y acorde al mercado' },
  { key: 'calidad_cantidad', label: 'Calidad y Cantidad',  ponderacion: 0.30, desc: 'El insumo cumple especificaciones de calidad y cantidad solicitada' },
  { key: 'plazo_entrega',    label: 'Plazo de entrega',    ponderacion: 0.20, desc: 'Entrega dentro del plazo acordado en la OC' },
  { key: 'seriedad',         label: 'Seriedad',            ponderacion: 0.10, desc: 'Compromiso, formalidad y cumplimiento de condiciones pactadas' },
  { key: 'tiempo_respuesta', label: 'Tiempo de respuesta', ponderacion: 0.20, desc: 'Respuesta ante consultas, reclamos o modificaciones' }
]

function PuntajeSelector({ valor, onChange }) {
  const color = v =>
    v >= 4 ? 'bg-green-600 border-green-600 text-white'
    : v >= 3 ? 'bg-amber-500 border-amber-500 text-white'
    : 'bg-red-500 border-red-500 text-white'

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {[1,2,3,4,5].map(v => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`w-9 h-9 rounded-lg border-2 text-sm font-bold transition-all ${
            valor === v ? color(v) : 'border-gray-300 text-gray-600 hover:border-blue-400'
          }`}>
          {v}
        </button>
      ))}
      <input
        type="number" min="1" max="5" step="0.5"
        value={valor ?? ''}
        placeholder="4.5"
        onChange={e => {
          const v = parseFloat(e.target.value)
          if (e.target.value === '') onChange(undefined)
          else if (!isNaN(v) && v >= 1 && v <= 5) onChange(v)
        }}
        className="w-16 text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
      />
    </div>
  )
}

function AreasSelector({ value, onChange }) {
  const toggle = a =>
    onChange(value.includes(a) ? value.filter(x => x !== a) : [...value, a])
  return (
    <div className="flex flex-wrap gap-2">
      {AREAS.map(a => (
        <label key={a} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${
          value.includes(a)
            ? 'bg-blue-600 border-blue-600 text-white font-medium'
            : 'border-gray-300 text-gray-600 hover:border-blue-400'
        }`}>
          <input type="checkbox" checked={value.includes(a)} onChange={() => toggle(a)} className="sr-only" />
          {a}
        </label>
      ))}
    </div>
  )
}

export default function NuevoInsumo() {
  const navigate  = useNavigate()
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  const [proveedor, setProveedor] = useState('')
  const [insumo, setInsumo]       = useState('')
  const [fecha, setFecha]         = useState(new Date().toISOString().split('T')[0])
  const [trimestre, setTrimestre] = useState('')
  const [anio, setAnio]           = useState(new Date().getFullYear())
  const [areas, setAreas]         = useState([])
  const [obs, setObs]             = useState('')
  const [puntajes, setPuntajes]   = useState({})

  const notaPreview = CRITERIOS.every(c => puntajes[c.key] !== undefined)
    ? CRITERIOS.reduce((s, c) => s + puntajes[c.key] * c.ponderacion, 0)
    : null

  const handleGuardar = async e => {
    e.preventDefault()
    if (!proveedor || !insumo || !trimestre) return setError('Completá proveedor, insumo y trimestre')
    const faltantes = CRITERIOS.filter(c => puntajes[c.key] === undefined)
    if (faltantes.length) return setError(`Falta puntuar: ${faltantes.map(c => c.label).join(', ')}`)
    setSaving(true)
    setError(null)
    try {
      const payload = { proveedorNombre: proveedor, descripcionInsumo: insumo, fecha, trimestre, anio, areas, obs }
      CRITERIOS.forEach(c => {
        payload[c.key] = { puntaje: puntajes[c.key], ponderacion: c.ponderacion }
      })
      await api.post('/evaluaciones-insumo', payload)
      navigate('/historial-insumos')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const estado = notaPreview !== null ? estadoNota(notaPreview) : null

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Evaluación de Insumo</h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleGuardar} className="space-y-5">

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Datos del insumo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
              <input value={proveedor} onChange={e => setProveedor(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del insumo *</label>
              <input value={insumo} onChange={e => setInsumo(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre *</label>
              <select value={trimestre} onChange={e => setTrimestre(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">—</option>
                {TRIMESTRES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
              <input type="number" value={anio} onChange={e => setAnio(Number(e.target.value))} min="2020" max="2099"
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
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Criterios de evaluación</h2>
            <span className="text-xs text-gray-400">Botones rápidos 1–5 · o escribí decimal (ej: 4.5)</span>
          </div>

          {CRITERIOS.map(c => (
            <div key={c.key} className="py-3 border-b border-gray-100 last:border-0 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{c.label}</span>
                  <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{(c.ponderacion*100).toFixed(0)}%</span>
                  <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                </div>
                {puntajes[c.key] !== undefined && (
                  <span className="text-xs font-semibold text-gray-500 shrink-0 ml-4">
                    Subtotal: {(puntajes[c.key] * c.ponderacion).toFixed(2)}
                  </span>
                )}
              </div>
              <PuntajeSelector valor={puntajes[c.key]} onChange={v => setPuntajes(p => ({...p, [c.key]: v}))} />
            </div>
          ))}

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">Nota Final</span>
              {notaPreview !== null && (
                <span className={`text-sm font-bold ${estado?.color === 'green' ? 'text-green-600' : estado?.color === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
                  {notaPreview.toFixed(2)} — {estado?.label}
                </span>
              )}
            </div>
            <ScoreBar nota={notaPreview} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar evaluación'}
          </button>
        </div>
      </form>
    </div>
  )
}
