module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol))
    return res.status(403).json({ error: 'Sin permisos suficientes' })
  next()
}
