import { barColor } from '../utils/scoring'

// Barra para nota 1-5
export default function ScoreBar({ nota }) {
  if (nota === null || nota === undefined)
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2" />
        <span className="text-xs text-gray-400 w-8 text-right">—</span>
      </div>
    )
  const pct = ((nota - 1) / 4) * 100   // escala 1-5 → 0-100%
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${barColor(nota)}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-700 font-semibold w-8 text-right">{nota.toFixed(2)}</span>
    </div>
  )
}
