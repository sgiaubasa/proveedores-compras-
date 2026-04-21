const mongoose = require('mongoose')

// Ponderaciones fijas para insumos (suman 1.0)
const PONDERACIONES = {
  cotizacion:       0.20,
  calidad_cantidad: 0.30,
  plazo_entrega:    0.20,
  seriedad:         0.10,
  tiempo_respuesta: 0.20
}

const criterioSchema = new mongoose.Schema({
  puntaje:     { type: Number, required: true, min: 1, max: 5 },
  ponderacion: { type: Number, required: true }
}, { _id: false })

const evaluacionInsumoSchema = new mongoose.Schema({
  proveedorNombre:  { type: String, required: true },
  descripcionInsumo:{ type: String, required: true },
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fecha:            { type: Date, required: true },
  trimestre:        { type: String, enum: ['1T','2T','3T','4T'], required: true },
  anio:             { type: Number, required: true },
  area:             String,

  // Criterios con ponderación fija
  cotizacion:       criterioSchema,
  calidad_cantidad: criterioSchema,
  plazo_entrega:    criterioSchema,
  seriedad:         criterioSchema,
  tiempo_respuesta: criterioSchema,

  nota_final: Number,
  obs:        String
}, { timestamps: true })

evaluacionInsumoSchema.pre('save', function (next) {
  const criterios = ['cotizacion','calidad_cantidad','plazo_entrega','seriedad','tiempo_respuesta']
  const total = criterios.reduce((sum, c) => {
    const v = this[c]
    return v ? sum + (v.puntaje * v.ponderacion) : sum
  }, 0)
  this.nota_final = Math.round(total * 100) / 100
  next()
})

module.exports = mongoose.model('EvaluacionInsumo', evaluacionInsumoSchema)
module.exports.PONDERACIONES = PONDERACIONES
