const router  = require('express').Router()
const auth    = require('../middleware/authMiddleware')
const roles   = require('../middleware/rolesMiddleware')
const EvalIns = require('../models/EvaluacionInsumo')

// Crear evaluación de insumo
router.post('/', auth, roles('admin','evaluador_compras'),
  async (req, res) => {
    try {
      const ev = new EvalIns({ ...req.body, userId: req.usuario._id })
      await ev.save()
      res.status(201).json(ev)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  }
)

// Listar con filtros
router.get('/', auth, async (req, res) => {
  const { proveedor, trimestre, anio, area } = req.query
  const filter = {}
  if (proveedor) filter.proveedorNombre = new RegExp(proveedor, 'i')
  if (trimestre) filter.trimestre = trimestre
  if (anio)      filter.anio = Number(anio)
  if (area)      filter.area = area
  const evs = await EvalIns.find(filter)
    .populate('userId', 'nombre area')
    .sort({ anio: -1, trimestre: -1, fecha: -1 })
  res.json(evs)
})

// Detalle
router.get('/:id', auth, async (req, res) => {
  const ev = await EvalIns.findById(req.params.id).populate('userId', 'nombre area')
  if (!ev) return res.status(404).json({ error: 'Evaluación no encontrada' })
  res.json(ev)
})

// Editar evaluación de insumo (solo admin)
router.put('/:id', auth, roles('admin'), async (req, res) => {
  try {
    const ev = await EvalIns.findById(req.params.id)
    if (!ev) return res.status(404).json({ error: 'No encontrada' })
    const campos = ['proveedorNombre','descripcionInsumo','trimestre','anio','areas','obs',
                    'cotizacion','calidad_cantidad','plazo_entrega','seriedad','tiempo_respuesta']
    campos.forEach(c => { if (req.body[c] !== undefined) ev[c] = req.body[c] })
    await ev.save()   // recalcula nota_final via pre-save
    res.json(ev)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// Eliminar (solo admin)
router.delete('/:id', auth, roles('admin'), async (req, res) => {
  await EvalIns.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

// Resumen anual por proveedor/insumo
router.get('/resumen/:proveedor/:anio', auth, async (req, res) => {
  const evs = await EvalIns.find({
    proveedorNombre: new RegExp(req.params.proveedor, 'i'),
    anio: Number(req.params.anio)
  }).sort({ trimestre: 1, fecha: 1 })

  const promedio = evs.length
    ? Math.round((evs.reduce((s, e) => s + e.nota_final, 0) / evs.length) * 100) / 100
    : null

  res.json({ evaluaciones: evs, promedio_anual: promedio })
})

module.exports = router
