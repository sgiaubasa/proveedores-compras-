const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const usuarioSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true },
  nombre:       { type: String, required: true },
  password:     { type: String, required: true },
  rol: {
    type: String,
    enum: ['admin', 'evaluador_tecnico', 'evaluador_compras', 'lectura'],
    default: 'lectura'
  },
  area: { type: String },
  // ETs que este usuario puede evaluar. Vacío = todas (solo para admin)
  etIdsPermitidos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EspecTecnica' }],
  // Sectores del listado de proveedores críticos que puede editar
  sectores: [{ type: String }],
  activo:             { type: Boolean, default: true },
  debeCambiarPassword:{ type: Boolean, default: true },
  resetToken:         { type: String },
  resetTokenExpira:   { type: Date },
  ultimoAcceso: Date
}, { timestamps: true })

// Hashear password antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// También hashear en findOneAndUpdate / findByIdAndUpdate si se cambia password
usuarioSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate()
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10)
  }
  next()
})

usuarioSchema.methods.verificarPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('Usuario', usuarioSchema)
