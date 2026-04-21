const router    = require('express').Router()
const auth      = require('../middleware/authMiddleware')
const roles     = require('../middleware/rolesMiddleware')
const Listado   = require('../models/ListadoProveedoresCriticos')

// GET todos los sectores (solo los que ya tienen datos)
router.get('/', auth, async (req, res) => {
  try {
    const docs = await Listado.find().populate('updatedBy', 'nombre').sort('sector')
    res.json(docs)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// GET un sector específico
router.get('/:sector', auth, async (req, res) => {
  try {
    const doc = await Listado.findOne({ sector: req.params.sector }).populate('updatedBy', 'nombre')
    res.json(doc || null)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// PUT (crear o actualizar) — admin o evaluador_compras
router.put('/:sector', auth, roles('admin', 'evaluador_compras'), async (req, res) => {
  try {
    const { responsable, servicios, insumos } = req.body
    const doc = await Listado.findOneAndUpdate(
      { sector: req.params.sector },
      {
        responsable,
        servicios: (servicios || []).filter(s => s.proveedor || s.servicio),
        insumos:   (insumos   || []).filter(i => i.proveedor || i.insumo),
        updatedBy: req.usuario._id
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('updatedBy', 'nombre')
    res.json(doc)
  } catch (e) { res.status(400).json({ error: e.message }) }
})

module.exports = router
