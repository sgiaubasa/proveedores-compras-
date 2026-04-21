const router       = require('express').Router()
const auth         = require('../middleware/authMiddleware')
const roles        = require('../middleware/rolesMiddleware')
const EspecTecnica = require('../models/EspecTecnica')

// Listar ETs vigentes activas
router.get('/', auth, async (req, res) => {
  const ets = await EspecTecnica.find({ activo: true, esVigente: true })
    .populate('creadoPor', 'nombre')
    .sort({ codigo: 1 })
  res.json(ets)
})

// Obtener ET por ID
router.get('/:id', auth, async (req, res) => {
  const et = await EspecTecnica.findById(req.params.id).populate('creadoPor', 'nombre')
  if (!et) return res.status(404).json({ error: 'ET no encontrada' })
  res.json(et)
})

// Crear ET (solo admin)
router.post('/', auth, roles('admin'), async (req, res) => {
  try {
    const et = await EspecTecnica.create({ ...req.body, creadoPor: req.usuario._id })
    res.status(201).json(et)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Crear nueva revisión de una ET existente
router.post('/:id/nueva-revision', auth, roles('admin'), async (req, res) => {
  try {
    const original = await EspecTecnica.findById(req.params.id)
    if (!original) return res.status(404).json({ error: 'ET no encontrada' })

    // Marcar original como no vigente
    original.esVigente = false
    await original.save()

    // Calcular nuevo número de revisión
    const revNum = parseInt(original.revision || '00') + 1
    const nuevaRevision = String(revNum).padStart(2, '0')

    // Crear nueva ET con los cambios del body
    const nueva = await EspecTecnica.create({
      ...req.body,
      codigo:     original.codigo,    // mismo código
      revision:   nuevaRevision,
      esVigente:  true,
      etPadreId:  original._id,
      creadoPor:  req.usuario._id
    })
    res.status(201).json(nueva)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Editar ET directamente (solo admin, misma revisión)
router.put('/:id', auth, roles('admin'), async (req, res) => {
  try {
    const et = await EspecTecnica.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!et) return res.status(404).json({ error: 'ET no encontrada' })
    res.json(et)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Desactivar ET (soft delete)
router.delete('/:id', auth, roles('admin'), async (req, res) => {
  await EspecTecnica.findByIdAndUpdate(req.params.id, { activo: false })
  res.json({ ok: true })
})

// Historial de revisiones de un código
router.get('/historial/:codigo', auth, async (req, res) => {
  const revs = await EspecTecnica.find({ codigo: req.params.codigo })
    .populate('creadoPor', 'nombre')
    .sort({ revision: -1 })
  res.json(revs)
})

// Próximo código sugerido
router.get('/meta/proximo-codigo', auth, roles('admin'), async (req, res) => {
  const last = await EspecTecnica.findOne({ esVigente: true }).sort({ codigo: -1 })
  if (!last) return res.json({ codigo: 'ET-PS-01' })
  const num = parseInt(last.codigo.replace('ET-PS-', '')) + 1
  res.json({ codigo: `ET-PS-${String(num).padStart(2, '0')}` })
})

module.exports = router
