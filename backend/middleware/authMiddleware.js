const jwt     = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Sin token' })
  try {
    const decoded   = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario     = await Usuario.findById(decoded.id)
    if (!req.usuario || !req.usuario.activo)
      return res.status(401).json({ error: 'Usuario inactivo' })
    // Actualizar último acceso
    await Usuario.findByIdAndUpdate(decoded.id, { ultimoAcceso: new Date() })
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}
