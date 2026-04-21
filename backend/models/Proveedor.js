const mongoose = require('mongoose')

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo:   { type: String, enum: ['servicio','insumo'], required: true },
  item:   String,
  etIds:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'EspecTecnica' }],
  area:   String,
  activo: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Proveedor', proveedorSchema)
