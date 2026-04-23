const mongoose = require('mongoose')

// Resultado por ítem en una evaluación de SERVICIO (numérico 1-5)
const itemResultSchema = new mongoose.Schema({
  n:           { type: Number, required: true },
  desc:        String,
  puntaje:     { type: Number, required: true, min: 1, max: 5 }, // 1 a 5
  ponderacion: { type: Number, required: true },                  // copiado de la ET
  obs:         String
}, { _id: false })

const evaluacionSchema = new mongoose.Schema({
  etId:      { type: mongoose.Schema.Types.ObjectId, ref: 'EspecTecnica', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  trimestre: { type: String, enum: ['1T','2T','3T','4T'], required: true },
  anio:      { type: Number, required: true },
  areas:     [String],
  items:     [itemResultSchema],
  obs:       String,
  // Calculados al guardar
  nota_final: Number   // Σ(puntaje_i × ponderacion_i)
}, { timestamps: true })

// Calcular nota final antes de guardar
evaluacionSchema.pre('save', function (next) {
  const total = this.items.reduce((sum, it) => sum + (it.puntaje * it.ponderacion), 0)
  this.nota_final = Math.round(total * 100) / 100
  next()
})

module.exports = mongoose.model('Evaluacion', evaluacionSchema)
