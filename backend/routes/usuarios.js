const router  = require('express').Router()
const auth    = require('../middleware/authMiddleware')
const roles   = require('../middleware/rolesMiddleware')
const Usuario = require('../models/Usuario')

// Listar usuarios
router.get('/', auth, roles('admin'), async (req, res) => {
  const usuarios = await Usuario.find()
    .select('-password')
    .populate('etIdsPermitidos', '_id codigo nombre')
    .sort({ createdAt: -1 })
  res.json(usuarios)
})

// Crear usuario (admin asigna email, password y ETs permitidas)
router.post('/', auth, roles('admin'), async (req, res) => {
  try {
    const { nombre, email, password, rol, area, etIdsPermitidos } = req.body
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' })
    const u = await Usuario.create({ nombre, email, password, rol, area, etIdsPermitidos: etIdsPermitidos || [] })
    const populated = await Usuario.findById(u._id).select('-password').populate('etIdsPermitidos', '_id codigo nombre')
    res.status(201).json(populated)
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'El email ya existe' })
    res.status(400).json({ error: e.message })
  }
})

// Actualizar usuario (rol, área, activo, ETs permitidas, password)
router.patch('/:id', auth, roles('admin'), async (req, res) => {
  try {
    const { password, ...rest } = req.body
    // Si viene nueva contraseña, actualizarla a través del modelo para que se hashee
    if (password) {
      const u = await Usuario.findById(req.params.id)
      if (!u) return res.status(404).json({ error: 'Usuario no encontrado' })
      u.password = password
      Object.assign(u, rest)
      await u.save()
      const populated = await Usuario.findById(u._id).select('-password').populate('etIdsPermitidos', '_id codigo nombre')
      return res.json(populated)
    }
    const u = await Usuario.findByIdAndUpdate(req.params.id, rest, { new: true })
      .select('-password')
      .populate('etIdsPermitidos', '_id codigo nombre')
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(u)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Eliminar usuario
router.delete('/:id', auth, roles('admin'), async (req, res) => {
  // No permitir eliminar al propio admin
  if (req.params.id === String(req.usuario._id))
    return res.status(400).json({ error: 'No podés eliminar tu propia cuenta' })
  await Usuario.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

module.exports = router
