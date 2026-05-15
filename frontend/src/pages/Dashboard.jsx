import { useEffect, useState, useMemo } from 'react'
import api from '../api'

const TRIMESTRES = ['T1', 'T2', 'T3', 'T4']

function estadoNota(n) {
  if (n >= 4) return { label: 'Aprobado',       color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200', bar: 'bg-green-500' }
  if (n >= 3) return { label: 'En seguimiento', color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200', bar: 'bg-amber-400' }
  return       { label: 'Crítico',              color: 'text-red-700',   bg: 'bg-red-50',    border: 'border-red-200',   bar: 'bg-red-500'   }
}

function BarraHorizontal({ label, valor, sub }) {
  const pct = Math.min(Math.round((valor / 5) * 100), 100)
  const e   = estadoNota(valor)
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-gray-700 truncate max-w-[210px]" title={label}>{label}</span>
        <span className={`text-sm font-bold ml-3 shrink-0 ${e.color}`}>{valor.toFixed(2)}</span>
      </div>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${e.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, colorClass = 'border-gray-200 bg-white', valueClass = 'text-gray-900' }) {
  return (
    <div className={`border rounded-xl p-5 ${colorClass}`}>
      <div className={`text-3xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [servicios, setServicios] = useState([])
  const [insumos,   setInsumos]   = useState([])
  const [loading,   setLoading]   = useState(true)

  const [filtroTipo, setFiltroTipo] = useState('todos')   // 'todos' | 'servicios' | 'insumos'
  const [filtroAnio, setFiltroAnio] = useState('')
  const [filtroTrim, setFiltroTrim] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/evaluaciones'),
      api.get('/evaluaciones-insumo')
    ]).then(([rs, ri]) => {
      setServicios(rs.data)
      setInsumos(ri.data)
    }).finally(() => setLoading(false))
  }, [])

  // Normalizar ambos tipos a forma común
  const todos = useMemo(() => {
    const s = servicios.map(e => ({
      _id:         e._id,
      tipo:        'servicio',
      proveedor:   e.etId?.proveedorNombre || '—',
      descripcion: e.etId?.nombre          || '—',
      codigo:      e.etId?.codigo          || '',
      nota_final:  e.nota_final,
      trimestre:   e.trimestre,
      anio:        e.anio,
      areas:       e.areas?.length ? e.areas : e.area ? [e.area] : [],
      fecha:       e.fecha
    }))
    const i = insumos.map(e => ({
      _id:         e._id,
      tipo:        'insumo',
      proveedor:   e.proveedorNombre  || '—',
      descripcion: e.descripcionInsumo || '—',
      codigo:      '',
      nota_final:  e.nota_final,
      trimestre:   e.trimestre,
      anio:        e.anio,
      areas:       e.areas?.length ? e.areas : e.area ? [e.area] : [],
      fecha:       e.fecha
    }))
    return [...s, ...i]
  }, [servicios, insumos])

  // Filtrado
  const filtrados = useMemo(() => todos.filter(e => {
    if (filtroTipo === 'servicios' && e.tipo !== 'servicio') return false
    if (filtroTipo === 'insumos'   && e.tipo !== 'insumo')   return false
    if (filtroAnio && e.anio !== Number(filtroAnio))          return false
    if (filtroTrim && e.trimestre !== filtroTrim)             return false
    return true
  }), [todos, filtroTipo, filtroAnio, filtroTrim])

  // KPIs
  const total      = filtrados.length
  const aprobados  = filtrados.filter(e => e.nota_final >= 4).length
  const seguimiento= filtrados.filter(e => e.nota_final >= 3 && e.nota_final < 4).length
  const criticos   = filtrados.filter(e => e.nota_final < 3).length
  const promedio   = total > 0 ? filtrados.reduce((s, e) => s + e.nota_final, 0) / total : null
  const pctAprobados = total > 0 ? Math.round((aprobados / total) * 100) : 0

  // Evolución por trimestre
  const evolucion = useMemo(() => {
    const map = {}
    filtrados.forEach(e => {
      const key = `${e.anio}-${e.trimestre}`
      if (!map[key]) map[key] = { key, trim: e.trimestre, anio: e.anio, notas: [] }
      map[key].notas.push(e.nota_final)
    })
    return Object.values(map)
      .map(g => ({ ...g, promedio: g.notas.reduce((s,n) => s+n,0) / g.notas.length }))
      .sort((a,b) => a.anio !== b.anio ? a.anio - b.anio : a.trim.localeCompare(b.trim))
  }, [filtrados])

  // Por proveedor
  const porProveedor = useMemo(() => {
    const map = {}
    filtrados.forEach(e => {
      const k = e.proveedor
      if (!map[k]) map[k] = { proveedor: k, notas: [], tipos: new Set() }
      map[k].notas.push(e.nota_final)
      map[k].tipos.add(e.tipo === 'servicio' ? 'Serv.' : 'Ins.')
    })
    return Object.values(map)
      .map(g => ({
        proveedor: g.proveedor,
        promedio:  g.notas.reduce((s,n)=>s+n,0) / g.notas.length,
        count:     g.notas.length,
        tipos:     [...g.tipos].join(' + ')
      }))
      .sort((a,b) => b.promedio - a.promedio)
  }, [filtrados])

  // Peores (para destacar riesgo)
  const peores = porProveedor.slice().reverse().filter(p => p.promedio < 4).slice(0,5)

  // Por área evaluadora
  const porArea = useMemo(() => {
    const map = {}
    filtrados.forEach(e => {
      ;(e.areas || []).forEach(a => {
        if (!map[a]) map[a] = { area: a, notas: [] }
        map[a].notas.push(e.nota_final)
      })
    })
    return Object.values(map)
      .map(g => ({ area: g.area, promedio: g.notas.reduce((s,n)=>s+n,0)/g.notas.length, count: g.notas.length }))
      .sort((a,b) => b.count - a.count)
  }, [filtrados])

  const aniosDisponibles = [...new Set(todos.map(e => e.anio))].filter(Boolean).sort()

  return (
    <div className="p-8 max-w-6xl space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Evaluaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vista consolidada · servicios e insumos</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {[['todos','Todos'],['servicios','Servicios'],['insumos','Insumos']].map(([v,l]) => (
              <button key={v} onClick={() => setFiltroTipo(v)}
                className={`px-3 py-1.5 font-medium transition-colors ${filtroTipo===v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {l}
              </button>
            ))}
          </div>
          <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">Todos los años</option>
            {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filtroTrim} onChange={e => setFiltroTrim(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">Todos los trimestres</option>
            {TRIMESTRES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(filtroAnio || filtroTrim || filtroTipo !== 'todos') && (
            <button onClick={() => { setFiltroAnio(''); setFiltroTrim(''); setFiltroTipo('todos') }}
              className="text-xs text-gray-400 hover:text-gray-700 underline px-1">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-24 text-sm">Cargando datos…</div>
      ) : total === 0 ? (
        <div className="text-center text-gray-400 py-24 bg-white rounded-xl border border-gray-200 text-sm">
          No hay evaluaciones para los filtros seleccionados.
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KpiCard label="Total evaluadas" value={total}
              sub={`${servicios.length} serv. · ${insumos.length} ins.`} />
            <KpiCard label="Aprobados ≥ 4" value={aprobados}
              sub={`${pctAprobados}% del total`}
              colorClass="bg-green-50 border-green-200" valueClass="text-green-700" />
            <KpiCard label="En seguimiento" value={seguimiento}
              sub="Nota 3 a 3.99"
              colorClass="bg-amber-50 border-amber-200" valueClass="text-amber-700" />
            <KpiCard label="Críticos" value={criticos}
              sub="Nota < 3"
              colorClass="bg-red-50 border-red-200" valueClass="text-red-700" />
            <KpiCard label="Promedio general" value={promedio?.toFixed(2) ?? '—'}
              colorClass="bg-blue-50 border-blue-200"
              valueClass={promedio >= 4 ? 'text-green-700' : promedio >= 3 ? 'text-amber-700' : 'text-red-700'} />
          </div>

          {/* Barra distribución */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Distribución de resultados</h2>
            <div className="h-6 rounded-full overflow-hidden flex gap-0.5">
              {aprobados  > 0 && <div className="bg-green-500 h-full rounded-l-full" style={{ width: `${(aprobados/total)*100}%` }} />}
              {seguimiento> 0 && <div className="bg-amber-400 h-full"                style={{ width: `${(seguimiento/total)*100}%` }} />}
              {criticos   > 0 && <div className="bg-red-500   h-full rounded-r-full" style={{ width: `${(criticos/total)*100}%`   }} />}
            </div>
            <div className="flex flex-wrap gap-5 mt-2.5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"/>Aprobados — {aprobados} ({Math.round((aprobados/total)*100)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"/>En seguimiento — {seguimiento} ({Math.round((seguimiento/total)*100)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500   inline-block"/>Críticos — {criticos} ({Math.round((criticos/total)*100)}%)</span>
            </div>
          </div>

          {/* Evolución + Top proveedores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Evolución por trimestre */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Evolución por trimestre</h2>
              {evolucion.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sin datos suficientes</p>
              ) : (
                <div className="space-y-4">
                  {evolucion.map(g => (
                    <BarraHorizontal
                      key={g.key}
                      label={`${g.trim} ${g.anio}`}
                      valor={g.promedio}
                      sub={`${g.notas.length} evaluación${g.notas.length !== 1 ? 'es' : ''} · prom. ${g.promedio.toFixed(2)}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Mejores y peores proveedores */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
              {/* Top mejores */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  Mejores proveedores <span className="text-green-600 normal-case">(por promedio)</span>
                </h2>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                  {porProveedor.slice(0,7).map((p,i) => (
                    <BarraHorizontal key={p.proveedor}
                      label={`${i+1}. ${p.proveedor}`}
                      valor={p.promedio}
                      sub={`${p.count} eval. · ${p.tipos}`}
                    />
                  ))}
                </div>
              </div>

              {/* Peores / críticos */}
              {peores.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-3">
                    Requieren atención <span className="text-gray-400 normal-case">(nota &lt; 4)</span>
                  </h2>
                  <div className="space-y-3">
                    {peores.map(p => (
                      <BarraHorizontal key={p.proveedor}
                        label={p.proveedor}
                        valor={p.promedio}
                        sub={`${p.count} eval. · ${p.tipos}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Por área evaluadora */}
          {porArea.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Evaluaciones por área / sector</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {porArea.map(a => {
                  const e = estadoNota(a.promedio)
                  return (
                    <div key={a.area} className={`rounded-lg border px-4 py-3 ${e.bg} ${e.border}`}>
                      <div className="text-xs font-semibold text-gray-700 truncate" title={a.area}>{a.area}</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-lg font-bold ${e.color}`}>{a.promedio.toFixed(2)}</span>
                        <span className="text-xs text-gray-400">{a.count} eval.</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tabla detalle */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Detalle ({filtrados.length} registros)
              </h2>
              <div className="flex gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/> Servicio</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/> Insumo</span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Proveedor</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Descripción</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Tipo</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Período</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Nota</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 border-b border-gray-200">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados
                    .slice()
                    .sort((a,b) => {
                      if (b.anio !== a.anio) return b.anio - a.anio
                      return b.trimestre.localeCompare(a.trimestre)
                    })
                    .map(e => {
                      const est = estadoNota(e.nota_final)
                      return (
                        <tr key={`${e.tipo}-${e._id}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 text-xs font-medium text-gray-800">{e.proveedor}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[200px] truncate" title={e.descripcion}>
                            {e.codigo && <span className="font-mono text-blue-600 mr-1">{e.codigo}</span>}
                            {e.descripcion}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.tipo === 'servicio' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                              {e.tipo === 'servicio' ? 'Serv.' : 'Ins.'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center text-xs text-gray-500 font-medium">{e.trimestre} {e.anio}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-sm font-bold ${est.color}`}>{e.nota_final?.toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${est.bg} ${est.color} ${est.border}`}>
                              {est.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
