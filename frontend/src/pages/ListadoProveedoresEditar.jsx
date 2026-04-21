import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

const ESTADO_OPTS = [
  { val: 'A', label: 'A — Aprobado' },
  { val: 'D', label: 'D — Dudoso' },
  { val: 'E', label: 'E — Eliminado' }
]

const SERVICIO_VACIO  = () => ({ proveedor: '', servicio: '', estado: 'A' })
const INSUMO_VACIO    = () => ({ proveedor: '', insumo:   '', estado: 'A' })

export default function ListadoProveedoresEditar() {
  const { sector }            = useParams()
  const sectorDecoded         = decodeURIComponent(sector)
  const navigate              = useNavigate()

  const [responsable, setResponsable] = useState('')
  const [servicios, setServicios]     = useState([SERVICIO_VACIO()])
  const [insumos, setInsumos]         = useState([INSUMO_VACIO()])
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)
  const [lastUpdate, setLastUpdate]   = useState(null)
  const [updatedBy, setUpdatedBy]     = useState(null)

  useEffect(() => {
    api.get(`/listado-proveedores/${encodeURIComponent(sectorDecoded)}`).then(r => {
      if (r.data) {
        setResponsable(r.data.responsable || '')
        setServicios(r.data.servicios?.length ? r.data.servicios : [SERVICIO_VACIO()])
        setInsumos(r.data.insumos?.length ? r.data.insumos : [INSUMO_VACIO()])
        setLastUpdate(r.data.updatedAt)
        setUpdatedBy(r.data.updatedBy?.nombre || null)
      }
    })
  }, [sectorDecoded])

  /* helpers servicios */
  const updServ = (i, f, v) => setServicios(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s))
  const addServ = () => setServicios(p => [...p, SERVICIO_VACIO()])
  const delServ = i  => setServicios(p => p.filter((_, idx) => idx !== i))

  /* helpers insumos */
  const updIns  = (i, f, v) => setInsumos(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s))
  const addIns  = () => setInsumos(p => [...p, INSUMO_VACIO()])
  const delIns  = i  => setInsumos(p => p.filter((_, idx) => idx !== i))

  const handleGuardar = async e => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.put(`/listado-proveedores/${encodeURIComponent(sectorDecoded)}`, {
        responsable,
        servicios,
        insumos
      })
      navigate('/listado-proveedores')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const formatFecha = iso => iso
    ? new Date(iso).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
    : null

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <button onClick={() => navigate('/listado-proveedores')}
          className="text-sm text-gray-500 hover:text-gray-800 mb-3 flex items-center gap-1">
          ← Volver al listado
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Proveedores Críticos</h1>
        <p className="text-base text-blue-700 font-semibold mt-0.5">{sectorDecoded}</p>
        <p className="text-xs text-gray-400 mt-0.5">PAU/06 — Anexo C · Rev. 02</p>
        {lastUpdate && (
          <p className="text-xs text-gray-400 mt-1">
            Última actualización: {formatFecha(lastUpdate)}
            {updatedBy ? ` · por ${updatedBy}` : ''}
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>
      )}

      <form onSubmit={handleGuardar} className="space-y-6">

        {/* Responsable */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable del sector</label>
          <input value={responsable} onChange={e => setResponsable(e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>

        {/* Servicios */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-blue-700 text-sm uppercase tracking-wide">Servicios críticos</h2>
              <p className="text-xs text-gray-400 mt-0.5">Dejá en blanco si el sector no gestiona servicios. Escribí N/A en la primera fila si corresponde.</p>
            </div>
            <button type="button" onClick={addServ} className="text-sm text-blue-600 hover:underline">+ Agregar fila</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 w-8">N°</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">Proveedor Crítico</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">Servicio</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 w-32">Estado</th>
                  <th className="px-3 py-2 border-b border-gray-200 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-2 py-1.5">
                      <input value={s.proveedor} onChange={e => updServ(i, 'proveedor', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={s.servicio} onChange={e => updServ(i, 'servicio', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={s.estado} onChange={e => updServ(i, 'estado', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300">
                        {ESTADO_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {servicios.length > 1 && (
                        <button type="button" onClick={() => delServ(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insumos */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-orange-600 text-sm uppercase tracking-wide">Insumos / Productos críticos</h2>
              <p className="text-xs text-gray-400 mt-0.5">Dejá en blanco si el sector no gestiona insumos. Escribí N/A en la primera fila si corresponde.</p>
            </div>
            <button type="button" onClick={addIns} className="text-sm text-orange-500 hover:underline">+ Agregar fila</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 w-8">N°</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">Proveedor Crítico</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200">Insumo / Producto</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 w-32">Estado</th>
                  <th className="px-3 py-2 border-b border-gray-200 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((ins, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                    <td className="px-2 py-1.5">
                      <input value={ins.proveedor} onChange={e => updIns(i, 'proveedor', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" />
                    </td>
                    <td className="px-2 py-1.5">
                      <input value={ins.insumo} onChange={e => updIns(i, 'insumo', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={ins.estado} onChange={e => updIns(i, 'estado', e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300">
                        {ESTADO_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {insumos.length > 1 && (
                        <button type="button" onClick={() => delIns(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/listado-proveedores')}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
