const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  n:            { type: Number, required: true },
  descripcion:  { type: String, required: true },
  criterio:     { type: String, required: true },
  ponderacion:  { type: Number, required: true, min: 0, max: 1 }, // ej: 0.20 = 20%
  resp_compras: [{ type: String, enum: ['i','a','d','ins'] }],
  resp_tecnica: [{ type: String, enum: ['i','a','d','ins'] }]
}, { _id: false })

const especTecnicaSchema = new mongoose.Schema({
  codigo:          { type: String, required: true, unique: true },
  revision:        { type: String, default: '00' },
  nombre:          { type: String, required: true },
  proveedorNombre: { type: String, required: true },
  area_tecnica:    { type: String, required: true },
  frecuencia:      { type: String, enum: ['bimestral','trimestral','mensual','anual'], required: true },
  fecha_vigencia:  { type: String },
  items:           [itemSchema],
  activo:          { type: Boolean, default: true },
  esVigente:       { type: Boolean, default: true },   // false en revisiones anteriores
  etPadreId:       { type: mongoose.Schema.Types.ObjectId, ref: 'EspecTecnica', default: null },
  creadoPor:       { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true })

module.exports = mongoose.model('EspecTecnica', especTecnicaSchema)
