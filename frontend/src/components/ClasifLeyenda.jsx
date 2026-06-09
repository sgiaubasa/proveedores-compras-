/**
 * ClasifLeyenda — referencia de clasificación A-B-C + cuadro de documento PAU
 * Se usa en encabezados de páginas de historial y evaluación
 */

// ── Cuadro de referencia documental (estilo ISO) ─────────────────────────────
export function DocRef({ codigo = 'PAU/06-A01', revision = '03' }) {
  const hoy   = new Date()
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const fecha = `${meses[hoy.getMonth()]}. ${hoy.getFullYear()}`

  return (
    <div className="grid grid-cols-[1fr_1px_auto] w-full border border-gray-300 rounded-lg overflow-hidden text-xs bg-white shadow-sm">
      {/* Columna izquierda: etiquetas */}
      <div className="divide-y divide-gray-200">
        {[['Código', codigo], ['Revisión', revision], ['Fecha', fecha]].map(([label, value]) => (
          <div key={label} className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-gray-400 w-14 shrink-0">{label}</span>
            <span className="font-semibold text-gray-700">{value}</span>
          </div>
        ))}
      </div>
      {/* Divisor vertical */}
      <div className="bg-gray-200" />
      {/* Columna derecha: ícono + título */}
      <div className="flex flex-col items-center justify-center px-3 gap-0.5">
        <span className="text-base">📋</span>
        <span className="font-bold text-gray-700 text-center leading-tight" style={{ fontSize: '10px' }}>
          Evaluación<br />Proveedores
        </span>
      </div>
    </div>
  )
}

// ── Leyenda de criterios A-B-C ────────────────────────────────────────────────
const CRITERIOS = [
  {
    letra: 'A',
    rango: '≥ 4.00',
    titulo: 'Aceptado',
    accion: 'Continuar con el proveedor',
    bg:     'bg-green-50',
    border: 'border-green-300',
    badge:  'bg-green-100 text-green-800 border-green-300',
    dot:    'bg-green-500',
  },
  {
    letra: 'B',
    rango: '3.00 – 3.99',
    titulo: 'Con seguimiento',
    accion: 'Monitorear en próximos períodos',
    bg:     'bg-amber-50',
    border: 'border-amber-300',
    badge:  'bg-amber-100 text-amber-800 border-amber-300',
    dot:    'bg-amber-400',
  },
  {
    letra: 'C',
    rango: '< 3.00',
    titulo: 'Rechazado',
    accion: 'Acción correctiva obligatoria',
    bg:     'bg-red-50',
    border: 'border-red-300',
    badge:  'bg-red-100 text-red-800 border-red-300',
    dot:    'bg-red-500',
  },
]

export function CriteriosClasif({ compact = false }) {
  if (compact) {
    // Versión horizontal compacta (para encabezados de tabla)
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Criterios:</span>
        {CRITERIOS.map(c => (
          <span key={c.letra}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold ${c.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.letra} · {c.rango} · {c.titulo}
          </span>
        ))}
      </div>
    )
  }

  // Versión completa con descripción de acción
  return (
    <div className="grid grid-cols-3 gap-2">
      {CRITERIOS.map(c => (
        <div key={c.letra} className={`rounded-xl border ${c.border} ${c.bg} p-3 space-y-1`}>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${c.badge}`}>
              {c.letra}
            </span>
            <div>
              <div className="text-xs font-bold text-gray-800">{c.titulo}</div>
              <div className="text-xs text-gray-500">Nota {c.rango}</div>
            </div>
          </div>
          <p className="text-xs text-gray-600 pl-8">{c.accion}</p>
        </div>
      ))}
    </div>
  )
}

// ── Bloque completo: DocRef + Criterios (para usar en encabezados de página) ──
export default function ClasifLeyenda({ codigo, revision }) {
  return (
    <div className="flex flex-wrap items-start gap-4 mb-6">
      <DocRef codigo={codigo} revision={revision} />
      <div className="flex-1 min-w-[300px]">
        <CriteriosClasif />
      </div>
    </div>
  )
}
