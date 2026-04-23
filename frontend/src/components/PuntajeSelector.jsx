export default function PuntajeSelector({ valor, onChange, size = 'md' }) {
  const btn = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  const inp = size === 'sm' ? 'w-14 text-xs' : 'w-20 text-sm'

  const colorActivo = v =>
    v >= 4 ? 'bg-green-600 border-green-600 text-white'
    : v >= 3 ? 'bg-amber-500 border-amber-500 text-white'
    : 'bg-red-500 border-red-500 text-white'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {[1,2,3,4,5].map(v => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className={`${btn} rounded-lg border-2 font-bold transition-all ${
            valor === v ? colorActivo(v) : 'border-gray-300 text-gray-600 hover:border-blue-400'
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
        className={`${inp} border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center`}
      />
    </div>
  )
}
