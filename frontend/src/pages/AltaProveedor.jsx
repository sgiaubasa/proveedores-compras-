import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

const FASES = [
  { val: 'i',   label: 'Inicial' },
  { val: 'a',   label: 'Anual' },
  { val: 'd',   label: 'Desempeño' },
  { val: 'ins', label: 'Inspección' }
]

const ITEM_VACIO = () => ({ descripcion: '', criterio: '', ponderacion: '', resp_compras: [], resp_tecnica: [] })

export default function AltaProveedor() {
  const navigate  = useNavigate()
  const { id, accion } = useParams()  // accion: 'editar' | 'revision'
  const esRevision = accion === 'revision'
  const esEdicion  = Boolean(id) && !esRevision

  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const [etOriginal, setEtOriginal] = useState(null)

  const [codigo,    setCodigo]    = useState('')
  const [nombre,    setNombre]    = useState('')
  const [proveedor, setProveedor] = useState('')
  const [area,      setArea]      = useState('')
  const [frecuencia,setFrecuencia]= useState('trimestral')
  const [revision,  setRevision]  = useState('00')
  const [items,     setItems]     = useState([ITEM_VACIO()])

  useEffect(() => {
    if (id) {
      api.get(`/espec-tecnicas/${id}`).then(r => {
        const et = r.data
        setEtOriginal(et)
        setCodigo(et.codigo)
        setNombre(et.nombre)
        setProveedor(et.proveedorNombre)
        setArea(et.area_tecnica)
        setFrecuencia(et.frecuencia)
        setRevision(et.revision)
        setItems(et.items.map(it => ({ ...it, ponderacion: String((it.ponderacion * 100).toFixed(0)) })))
      })
    } else {
      api.get('/espec-tecnicas/meta/proximo-codigo').then(r => setCodigo(r.data.codigo))
    }
  }, [id])

  const agregarItem = () => setItems(prev => [...prev, ITEM_VACIO()])
  const quitarItem  = idx => setItems(prev => prev.filter((_, i) => i !== idx))
  const actualizarItem = (idx, field, value) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it))
  const toggleFase = (idx, campo, fase) =>
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it
      const arr = it[campo].includes(fase) ? it[campo].filter(f => f !== fase) : [...it[campo], fase]
      return { ...it, [campo]: arr }
    }))

  // Suma de ponderaciones para validación
  const sumaPond = items.reduce((s, it) => s + (parseFloat(it.ponderacion) || 0), 0)

  const handleGuardar = async e => {
    e.preventDefault()
    if (!codigo || !nombre || !proveedor || !area) return setError('Completá todos los campos obligatorios')
    if (Math.abs(sumaPond - 100) > 0.1) return setError(`La suma de ponderaciones debe ser 100%. Actualmente: ${sumaPond.toFixed(1)}%`)
    setSaving(true)
    setError(null)
    try {
      const payload = {
        codigo, revision, nombre,
        proveedorNombre: proveedor,
        area_tecnica: area,
        frecuencia,
        items: items.map((it, i) => ({
          ...it,
          n: i + 1,
          ponderacion: parseFloat(it.ponderacion) / 100
        }))
      }
      if (esRevision) {
        await api.post(`/espec-tecnicas/${id}/nueva-revision`, payload)
      } else if (esEdicion) {
        await api.put(`/espec-tecnicas/${id}`, payload)
      } else {
        await api.post('/espec-tecnicas', payload)
      }
      navigate('/especificaciones')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const titulo = esRevision ? `Nueva Revisión — ${etOriginal?.codigo}`
    : esEdicion ? 'Editar Especificación Técnica'
    : 'Nueva Especificación Técnica'

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{titulo}</h1>
      {esRevision && etOriginal && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
          Estás creando una <strong>nueva revisión</strong> a partir de <strong>{etOriginal.codigo} Rev. {etOriginal.revision}</strong>.
          La revisión anterior quedará como histórica.
        </p>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* Datos generales */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Datos generales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código ET *</label>
              <input value={codigo} onChange={e => setCodigo(e.target.value)} required
                disabled={esRevision}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revisión</label>
              <input value={revision} onChange={e => setRevision(e.target.value)} disabled={esRevision}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-400" />
              {esRevision && <p className="text-xs text-gray-400 mt-0.5">Se incrementará automáticamente</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del servicio *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
              <input value={proveedor} onChange={e => setProveedor(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área técnica *</label>
              <input value={area} onChange={e => setArea(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
            <select value={frecuencia} onChange={e => setFrecuencia(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="mensual">Mensual</option>
              <option value="bimestral">Bimestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
        </div>

        {/* Ítems */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Ítems de evaluación</h2>
              <p className={`text-xs mt-0.5 font-semibold ${Math.abs(sumaPond - 100) < 0.1 ? 'text-green-600' : 'text-amber-600'}`}>
                Suma ponderaciones: {sumaPond.toFixed(1)}% {Math.abs(sumaPond - 100) < 0.1 ? '✓' : '(debe ser 100%)'}
              </p>
            </div>
            <button type="button" onClick={agregarItem} className="text-sm text-blue-600 hover:underline">+ Agregar ítem</button>
          </div>

          {items.map((it, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Ítem {idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => quitarItem(idx)} className="text-xs text-red-500 hover:underline">Quitar</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Descripción del factor *</label>
                  <input value={it.descripcion} onChange={e => actualizarItem(idx, 'descripcion', e.target.value)} required
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ponderación % *</label>
                  <input type="number" value={it.ponderacion} onChange={e => actualizarItem(idx, 'ponderacion', e.target.value)}
                    min="1" max="100" step="5" required placeholder="ej: 20"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Criterio de aceptación *</label>
                <textarea value={it.criterio} onChange={e => actualizarItem(idx, 'criterio', e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fases — Área Compras</label>
                  <div className="flex gap-2 flex-wrap">
                    {FASES.map(f => (
                      <label key={f.val} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input type="checkbox" checked={it.resp_compras.includes(f.val)} onChange={() => toggleFase(idx, 'resp_compras', f.val)} className="rounded" />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fases — Área Técnica</label>
                  <div className="flex gap-2 flex-wrap">
                    {FASES.map(f => (
                      <label key={f.val} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input type="checkbox" checked={it.resp_tecnica.includes(f.val)} onChange={() => toggleFase(idx, 'resp_tecnica', f.val)} className="rounded" />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/especificaciones')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className={`px-6 py-2.5 text-white font-medium rounded-lg disabled:opacity-50 ${esRevision ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {saving ? 'Guardando…' : esRevision ? 'Crear nueva revisión' : esEdicion ? 'Guardar cambios' : 'Crear ET'}
          </button>
        </div>
      </form>
    </div>
  )
}
