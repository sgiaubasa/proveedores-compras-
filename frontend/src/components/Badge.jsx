import { estadoNota, claseNota } from '../utils/scoring'

// Badge de nota final 1-5
export function BadgeNota({ nota }) {
  const { label } = estadoNota(nota)
  const cls = claseNota(nota)
  const texto = nota !== null && nota !== undefined ? `${nota.toFixed(2)} — ${label}` : 'Sin evaluar'
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${cls}`}>
      {texto}
    </span>
  )
}

// Badge de trimestre
export function BadgeTrimestre({ trimestre }) {
  const map = {
    '1T': 'bg-blue-50 text-blue-700',
    '2T': 'bg-teal-50 text-teal-700',
    '3T': 'bg-amber-50 text-amber-700',
    '4T': 'bg-purple-50 text-purple-700'
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${map[trimestre] || 'bg-gray-100 text-gray-500'}`}>
      {trimestre}
    </span>
  )
}

// Badge de tipo (servicio / insumo)
export function BadgeTipo({ tipo }) {
  if (tipo === 'insumo')
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-50 text-orange-700">Insumo</span>
  return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">Servicio</span>
}
