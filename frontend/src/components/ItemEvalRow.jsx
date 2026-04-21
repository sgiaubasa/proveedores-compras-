export default function ItemEvalRow({ item, resultado, onChange }) {
  const res = resultado?.res || null
  const obs = resultado?.obs || ''

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold flex items-center justify-center">
          {item.n}
        </span>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{item.descripcion}</p>
          <p className="text-sm text-gray-500 mt-0.5">{item.criterio}</p>
        </div>
      </div>

      {/* Toggle Cumple / No Cumple / N/A */}
      <div className="flex gap-2 ml-10">
        {[
          { val: 'c',  label: '✓ Cumple',     active: 'bg-green-600 text-white', inactive: 'border-gray-300 text-gray-600 hover:border-green-400' },
          { val: 'n',  label: '✗ No cumple',  active: 'bg-red-600 text-white',   inactive: 'border-gray-300 text-gray-600 hover:border-red-400' },
          { val: 'na', label: '— N/A',         active: 'bg-gray-500 text-white',  inactive: 'border-gray-300 text-gray-600 hover:border-gray-400' }
        ].map(({ val, label, active, inactive }) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange({ res: val, obs })}
            className={`px-3 py-1.5 text-sm rounded border font-medium transition-colors ${res === val ? active : `border ${inactive} bg-white`}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Observación */}
      <div className="ml-10">
        <input
          type="text"
          placeholder="Observación (opcional)…"
          value={obs}
          onChange={e => onChange({ res, obs: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
    </div>
  )
}
