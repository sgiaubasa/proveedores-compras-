// Nota final 1-5 → estado semáforo (igual que el Excel AUBASA)
export function estadoNota(nota) {
  if (nota === null || nota === undefined) return { label: 'Sin evaluar', color: 'gray' }
  if (nota >= 4)  return { label: 'Conforme',           color: 'green' }
  if (nota >= 3)  return { label: 'Con seguimiento',    color: 'amber' }
  return           { label: 'No califica',              color: 'red'   }
}

export function claseNota(nota) {
  const { color } = estadoNota(nota)
  const map = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red:   'bg-red-50   text-red-700   border-red-200',
    gray:  'bg-gray-100 text-gray-500  border-gray-200'
  }
  return map[color]
}

export function barColor(nota) {
  if (!nota) return 'bg-gray-200'
  if (nota >= 4) return 'bg-green-500'
  if (nota >= 3) return 'bg-amber-400'
  return 'bg-red-500'
}

// Clasificación A-B-C según OM-106 IRAM
export function clasificacionABC(nota) {
  if (nota === null || nota === undefined) return null
  if (nota >= 4) return { letra: 'A', label: 'Aceptado',    cls: 'bg-green-100 text-green-800 border-green-300' }
  if (nota >= 3) return { letra: 'B', label: 'Seguimiento', cls: 'bg-amber-100 text-amber-800 border-amber-300' }
  return               { letra: 'C', label: 'Rechazado',   cls: 'bg-red-100   text-red-800   border-red-300'   }
}

export const ACCION_TIPOS = [
  { value: 'plan_mejora',      label: 'Plan de mejora' },
  { value: 'suspension',       label: 'Suspensión temporal' },
  { value: 'cambio_proveedor', label: 'Cambio de proveedor' },
  { value: 'otra',             label: 'Otra acción' },
]

export const ACCION_ESTADOS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_curso',  label: 'En curso' },
  { value: 'cerrada',   label: 'Cerrada' },
]

export const TRIMESTRES = ['1T','2T','3T','4T']
export const TRIM_LABELS = { '1T':'1° Trimestre (Ene-Mar)', '2T':'2° Trimestre (Abr-Jun)', '3T':'3° Trimestre (Jul-Sep)', '4T':'4° Trimestre (Oct-Dic)' }
