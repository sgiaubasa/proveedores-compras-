const router  = require('express').Router()
const jwt     = require('jsonwebtoken')
const crypto  = require('crypto')
const Usuario = require('../models/Usuario')
const { enviarResetPassword } = require('../utils/mailer')

// Login con email + password
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' })

  const user = await Usuario.findOne({ email: email.toLowerCase() })
    .populate('etIdsPermitidos', '_id codigo nombre')

  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' })
  if (!user.activo) return res.status(401).json({ error: 'Usuario desactivado. Contacte al administrador.' })

  const ok = await user.verificarPassword(password)
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' })

  await Usuario.findByIdAndUpdate(user._id, { ultimoAcceso: new Date() })

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.json({
    token,
    usuario: {
      id:                  user._id,
      nombre:              user.nombre,
      email:               user.email,
      rol:                 user.rol,
      area:                user.area,
      etIdsPermitidos:     user.etIdsPermitidos,
      sectores:            user.sectores || [],
      debeCambiarPassword: user.debeCambiarPassword ?? false
    }
  })
})

// Solicitar reset de contraseña (olvidé mi contraseña)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email requerido' })

    const user = await Usuario.findOne({ email: email.toLowerCase() })
    // Siempre responder OK para no revelar si el email existe
    if (!user || !user.activo) return res.json({ ok: true })

    const token   = crypto.randomBytes(32).toString('hex')
    const expira  = new Date(Date.now() + 60 * 60 * 1000)  // 1 hora

    await Usuario.findByIdAndUpdate(user._id, {
      resetToken:       token,
      resetTokenExpira: expira
    })

    const resultado = await enviarResetPassword(user.email, user.nombre, token)
    console.log(`[reset] Solicitud para ${email} — modo: ${resultado.modo}`)
    res.json({ ok: true, modo: resultado.modo })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al procesar la solicitud' })
  }
})

// Confirmar nuevo password con token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { nuevaPassword } = req.body
    if (!nuevaPassword || nuevaPassword.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

    const user = await Usuario.findOne({
      resetToken:       req.params.token,
      resetTokenExpira: { $gt: new Date() }
    })
    if (!user) return res.status(400).json({ error: 'El link es inválido o ya expiró' })

    user.password            = nuevaPassword
    user.debeCambiarPassword = false
    user.resetToken          = undefined
    user.resetTokenExpira    = undefined
    await user.save()

    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Actualizar perfil propio (nombre)
router.put('/perfil', require('../middleware/authMiddleware'), async (req, res) => {
  const { nombre } = req.body
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre no puede estar vacío' })
  const u = await Usuario.findByIdAndUpdate(
    req.usuario._id,
    { nombre: nombre.trim() },
    { new: true }
  ).select('-password')
  res.json({ nombre: u.nombre })
})

// Cambiar contraseña (primer ingreso o voluntario)
router.put('/cambiar-password', require('../middleware/authMiddleware'), async (req, res) => {
  const { nuevaPassword } = req.body
  if (!nuevaPassword || nuevaPassword.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  const u = await Usuario.findById(req.usuario._id)
  u.password            = nuevaPassword
  u.debeCambiarPassword = false
  await u.save()
  res.json({ ok: true })
})

// Obtener perfil actual
router.get('/me', require('../middleware/authMiddleware'), async (req, res) => {
  const user = await Usuario.findById(req.usuario._id)
    .populate('etIdsPermitidos', '_id codigo nombre')
    .select('-password')
  res.json(user)
})

module.exports = router
