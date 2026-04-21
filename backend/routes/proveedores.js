const router    = require('express').Router()
const auth      = require('../middleware/authMiddleware')
const roles     = require('../middleware/rolesMiddleware')
const Proveedor = require('../models/Proveedor')

router.get('/', auth, async (req, res) => {
  const proveedores = await Proveedor.find({ activo: true })
    .populate('etIds', 'codigo nombre')
    .sort({ nombre: 1 })
  res.json(proveedores)
})

router.get('/:id', auth, async (req, res) => {
  const p = await Proveedor.findById(req.params.id).populate('etIds', 'codigo nombre')
  if (!p) return res.status(404).json({ error: 'Proveedor no encontrado' })
  res.json(p)
})

router.post('/', auth, roles('admin','evaluador_compras'), async (req, res) => {
  try {
    const p = await Proveedor.create(req.body)
    res.status(201).json(p)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.put('/:id', auth, roles('admin','evaluador_compras'), async (req, res) => {
  try {
    const p = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!p) return res.status(404).json({ error: 'Proveedor no encontrado' })
    res.json(p)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.delete('/:id', auth, roles('admin'), async (req, res) => {
  await Proveedor.findByIdAndUpdate(req.params.id, { activo: false })
  res.json({ ok: true })
})

module.exports = router
