import { useState, useEffect } from 'react'

const AREAS_FIJAS = ['Compras','Área Técnica','GO','GC','CAE','SAV','JAV','CCM','SGI']

export default function AreasSelector({ value = [], onChange }) {
  // Detectar si hay un valor "Otro: texto" ya guardado
  const otroGuardado = value.find(a => !AREAS_FIJAS.includes(a) && a !== 'Otro') || ''
  const tieneOtro = value.includes('Otro') || otroGuardado !== ''

  const [otroTexto, setOtroTexto] = useState(otroGuardado)

  useEffect(() => {
    const nuevo = value.find(a => !AREAS_FIJAS.includes(a) && a !== 'Otro') || ''
    setOtroTexto(nuevo)
  }, [value.join(',')])

  const toggle = a => {
    if (value.includes(a)) onChange(value.filter(x => x !== a))
    else onChange([...value, a])
  }

  const toggleOtro = () => {
    if (tieneOtro) {
      setOtroTexto('')
      onChange(value.filter(a => AREAS_FIJAS.includes(a)))
    } else {
      onChange([...value, 'Otro'])
    }
  }

  const handleOtroTexto = txt => {
    setOtroTexto(txt)
    const base = value.filter(a => AREAS_FIJAS.includes(a))
    if (txt.trim()) onChange([...base, txt.trim()])
    else onChange([...base, 'Otro'])
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {AREAS_FIJAS.map(a => (
          <label key={a} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors select-none ${
            value.includes(a)
              ? 'bg-blue-600 border-blue-600 text-white font-medium'
              : 'border-gray-300 text-gray-600 hover:border-blue-400'
          }`}>
            <input type="checkbox" checked={value.includes(a)} onChange={() => toggle(a)} className="sr-only" />
            {a}
          </label>
        ))}

        {/* Botón Otro */}
        <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors select-none ${
          tieneOtro
            ? 'bg-blue-600 border-blue-600 text-white font-medium'
            : 'border-gray-300 text-gray-600 hover:border-blue-400'
        }`}>
          <input type="checkbox" checked={tieneOtro} onChange={toggleOtro} className="sr-only" />
          Otro
        </label>
      </div>

      {/* Input texto cuando Otro está seleccionado */}
      {tieneOtro && (
        <input
          type="text"
          value={otroTexto}
          onChange={e => handleOtroTexto(e.target.value)}
          placeholder="Especificá cuál área…"
          autoFocus
          className="w-full max-w-xs text-sm border border-blue-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      )}

      {/* Resumen seleccionados */}
      {value.length > 0 && (
        <p className="text-xs text-blue-600 font-medium">
          ✓ {value.join(' + ')}
        </p>
      )}
    </div>
  )
}
