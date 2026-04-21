const mongoose = require('mongoose')

const itemServicioSchema = new mongoose.Schema({
  proveedor: { type: String, default: '' },
  servicio:  { type: String, default: '' },
  estado:    { type: String, enum: ['A','D','E'], default: 'A' }
}, { _id: false })

const itemInsumoSchema = new mongoose.Schema({
  proveedor: { type: String, default: '' },
  insumo:    { type: String, default: '' },
  estado:    { type: String, enum: ['A','D','E'], default: 'A' }
}, { _id: false })

const listadoSchema = new mongoose.Schema({
  sector:      { type: String, required: true, unique: true },
  responsable: { type: String, default: '' },
  servicios:   { type: [itemServicioSchema], default: [] },
  insumos:     { type: [itemInsumoSchema],   default: [] },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true })

module.exports = mongoose.model('ListadoProveedoresCriticos', listadoSchema)
