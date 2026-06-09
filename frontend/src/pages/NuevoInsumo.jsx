import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { TRIMESTRES, TRIM_LABELS, estadoNota, clasificacionABC, ACCION_TIPOS } from '../utils/scoring'
import { DocRef, CriteriosClasif } from '../components/ClasifLeyenda'
import ScoreBar from '../components/ScoreBar'
import AreasSelector from '../components/AreasSelector'
import PuntajeSelector from '../components/PuntajeSelector'

const CRITERIOS = [
  { key: 'cotizacion',       label: 'Cotización',          ponderacion: 0.20, desc: 'Precio competitivo y acorde al mercado' },
  { key: 'calidad_cantidad', label: 'Calidad y Cantidad',  ponderacion: 0.30, desc: 'El insumo cumple especificaciones de calidad y cantidad solicitada' },
  { key: 'plazo_entrega',    label: 'Plazo de entrega',    ponderacion: 0.20, desc: 'Entrega dentro del plazo acordado en la OC' },
  { key: 'seriedad',         label: 'Seriedad',            ponderacion: 0.10, desc: 'Compromiso, formalidad y cumplimiento de condiciones pactadas' },
  { key: 'tiempo_respuesta', label: 'Tiempo de respuesta', ponderacion: 0.20, desc: 'Respuesta ante consultas, reclamos o modificaciones' }
]

export default function NuevoInsumo() {
  const navigate  = useNavigate()
  const { usuario } = useAuth()
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  // Proveedores e insumos del listado según sector del usuario
  const [listadoInsumos, setListadoInsumos] = useState([])   // [{proveedor, insumo}]
  const [modoLibre, setModoLibre]           = useState(false) // fallback texto libre

  useEffect(() => {
    const sectores = usuario?.rol === 'admin' ? null : (usuario?.sectores || [])
    if (sectores !== null && sectores.length === 0) {
      setModoLibre(true)
      return
    }
    api.get('/listado-proveedores').then(r => {
      const docs = r.data
      const filtrados = sectores === null ? docs : docs.filter(d => sectores.includes(d.sector))
      const items = filtrados.flatMap(d => (d.insumos || []).map(i => ({ proveedor: i.proveedor, insumo: i.insumo, sector: d.sector })))
      if (items.length === 0) {
        setModoLibre(true)
      } else {
        setListadoInsumos(items)
      }
    }).catch(() => setModoLibre(true))
  }, [usuario])

  const [proveedor, setProveedor] = useState('')
  const [insumo, setInsumo]       = useState('')
  const [fecha, setFecha]         = useState(new Date().toISOString().split('T')[0])
  const [trimestre, setTrimestre] = useState('')
  const [anio, setAnio]           = useState(new Date().getFullYear())
  const [areas, setAreas]         = useState([])
  const [obs, setObs]             = useState('')
  const [puntajes, setPuntajes]   = useState({})
  const [cantidadPrestaciones, setCantidadPrestaciones] = useState(1)
  const [accion, setAccion]       = useState({ tipo: '', descripcion: '', fechaImpl: '', responsable: '', estado: 'pendiente' })

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
      const payload = { proveedorNombre: proveedor, descripcionInsumo: insumo, fecha, trimestre, anio, areas, obs, cantidadPrestaciones }
      CRITERIOS.forEach(c => {
        payload[c.key] = { puntaje: puntajes[c.key], ponderacion: c.ponderacion }
      })
      if (accion.tipo) payload.accion = accion
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
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Evaluación de Insumo</h1>
        <DocRef codigo="PAU/06-A01" revision="03" />
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleGuardar} className="space-y-5">

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Datos del insumo</h2>
          {/* Selección desde listado o modo libre */}
          {!modoLibre && listadoInsumos.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
                  📋 Seleccioná desde el listado de proveedores críticos de tu sector
                </p>
                <button type="button" onClick={() => setModoLibre(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline ml-3 shrink-0">
                  Ingresar manualmente
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor e insumo *</label>
                <select
                  value={proveedor && insumo ? `${proveedor}||${insumo}` : ''}
                  onChange={e => {
                    const [p, i] = e.target.value.split('||')
                    setProveedor(p || '')
                    setInsumo(i || '')
                  }}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">— Seleccioná proveedor / insumo —</option>
                  {listadoInsumos.map((it, idx) => (
                    <option key={idx} value={`${it.proveedor}||${it.insumo}`}>
                      {it.proveedor} — {it.insumo}
                    </option>
                  ))}
                </select>
                {proveedor && (
                  <p className="mt-1 text-xs text-gray-500">
                    Proveedor: <strong>{proveedor}</strong> · Insumo: <strong>{insumo}</strong>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {modoLibre && listadoInsumos.length === 0 && usuario?.rol !== 'admin' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  Tu sector aún no tiene proveedores cargados en el listado. Ingresalos manualmente.
                </p>
              )}
              {modoLibre && listadoInsumos.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Ingresando manualmente</p>
                  <button type="button" onClick={() => setModoLibre(false)}
                    className="text-xs text-blue-600 hover:underline">
                    ← Volver al listado
                  </button>
                </div>
              )}
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
            </div>
          )}
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

          <div className="pt-2 border-t border-gray-200 space-y-2">
            <CriteriosClasif compact />
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

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de entregas / pedidos recibidos en el período
              <span className="ml-1 text-xs text-gray-400 font-normal">(cuántas veces entregó el insumo este trimestre)</span>
            </label>
            <input type="number" value={cantidadPrestaciones}
              onChange={e => setCantidadPrestaciones(Math.max(1, Number(e.target.value)))}
              min="1" step="1"
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>
        </div>

        {/* Acción documentada — aparece cuando nota < 3 */}
        {notaPreview !== null && notaPreview < 3 && (
          <div className="border-2 border-red-300 bg-red-50 rounded-xl p-5 space-y-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Clasificación C — Acción documentada requerida</h3>
                <p className="text-xs text-red-600 mt-0.5">La nota es inferior a 3. Documentá la acción a tomar según ISO 9001 (OM-106 IRAM).</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de acción *</label>
              <div className="flex flex-wrap gap-2">
                {ACCION_TIPOS.map(t => (
                  <button key={t.value} type="button" onClick={() => setAccion(a => ({ ...a, tipo: t.value }))}
                    className={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${accion.tipo === t.value ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-700 hover:border-red-400'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la acción</label>
              <textarea value={accion.descripcion} onChange={e => setAccion(a => ({ ...a, descripcion: e.target.value }))}
                rows={2} placeholder="Describí el plan o acción a ejecutar…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input type="text" value={accion.responsable} onChange={e => setAccion(a => ({ ...a, responsable: e.target.value }))}
                  placeholder="Nombre o área…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de implementación</label>
                <input type="date" value={accion.fechaImpl} onChange={e => setAccion(a => ({ ...a, fechaImpl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
              </div>
            </div>
          </div>
        )}

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
