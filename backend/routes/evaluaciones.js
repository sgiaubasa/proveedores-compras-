const router = require('express').Router()
const auth   = require('../middleware/authMiddleware')
const roles  = require('../middleware/rolesMiddleware')
const Eval   = require('../models/Evaluacion')

// Crear evaluación de servicio (trimestral, numérica 1-5)
router.post('/', auth, roles('admin','evaluador_tecnico','evaluador_compras'),
  async (req, res) => {
    try {
      const ev = new Eval({ ...req.body, userId: req.usuario._id })
      await ev.save()
      res.status(201).json(ev)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  }
)

// Listar por ET
router.get('/por-et/:etId', auth, async (req, res) => {
  const evs = await Eval.find({ etId: req.params.etId })
    .populate('userId', 'nombre area')
    .sort({ anio: -1, trimestre: -1 })
  res.json(evs)
})

// Listar todas con filtros
router.get('/', auth, async (req, res) => {
  const { etId, area, trimestre, anio } = req.query
  const filter = {}
  if (etId)     filter.etId     = etId
  if (area)     filter.area     = area
  if (trimestre)filter.trimestre= trimestre
  if (anio)     filter.anio     = Number(anio)
  const evs = await Eval.find(filter)
    .populate('etId', 'codigo nombre proveedorNombre')
    .populate('userId', 'nombre area')
    .sort({ anio: -1, trimestre: -1 })
  res.json(evs)
})

// Detalle de una evaluación
router.get('/:id', auth, async (req, res) => {
  const ev = await Eval.findById(req.params.id)
    .populate('etId', 'codigo nombre proveedorNombre area_tecnica')
    .populate('userId', 'nombre area')
  if (!ev) return res.status(404).json({ error: 'Evaluación no encontrada' })
  res.json(ev)
})

// Eliminar (solo admin)
router.delete('/:id', auth, roles('admin'), async (req, res) => {
  await Eval.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

// Resumen anual de una ET: promedio de notas por trimestre
router.get('/resumen-anual/:etId/:anio', auth, async (req, res) => {
  const evs = await Eval.find({
    etId: req.params.etId,
    anio: Number(req.params.anio)
  }).populate('userId', 'nombre area').sort({ trimestre: 1 })

  const porTrimestre = { '1T': null, '2T': null, '3T': null, '4T': null }
  evs.forEach(ev => { porTrimestre[ev.trimestre] = ev.nota_final })

  const notas = Object.values(porTrimestre).filter(v => v !== null)
  const promedio_anual = notas.length
    ? Math.round((notas.reduce((s, v) => s + v, 0) / notas.length) * 100) / 100
    : null

  res.json({ evaluaciones: evs, porTrimestre, promedio_anual, anio: Number(req.params.anio) })
})

module.exports = router
