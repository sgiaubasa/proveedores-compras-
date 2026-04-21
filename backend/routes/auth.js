const router  = require('express').Router()
const jwt     = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

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
      id:               user._id,
      nombre:           user.nombre,
      email:            user.email,
      rol:              user.rol,
      area:             user.area,
      etIdsPermitidos:  user.etIdsPermitidos   // array de {_id, codigo, nombre}
    }
  })
})

// Obtener perfil actual
router.get('/me', require('../middleware/authMiddleware'), async (req, res) => {
  const user = await Usuario.findById(req.usuario._id)
    .populate('etIdsPermitidos', '_id codigo nombre')
    .select('-password')
  res.json(user)
})

module.exports = router
