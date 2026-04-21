const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const path     = require('path')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// Conexión MongoDB + inicialización de usuario admin
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB conectado')
    await initAdmin()
  })
  .catch(err => console.error('Error MongoDB:', err))

async function initAdmin() {
  try {
    const Usuario = require('./models/Usuario')
    const existe  = await Usuario.findOne({ email: 'admin@aubasa.com' })
    if (!existe) {
      await Usuario.create({
        nombre:   'Administrador',
        email:    'admin@aubasa.com',
        password: 'admin123',
        rol:      'admin',
        activo:   true
      })
      console.log('✓ Usuario admin creado  →  admin@aubasa.com / admin123')
    }
  } catch (e) {
    console.error('Error initAdmin:', e.message)
  }
}

app.use('/api/auth',                 require('./routes/auth'))
app.use('/api/usuarios',             require('./routes/usuarios'))
app.use('/api/espec-tecnicas',       require('./routes/especTecnicas'))
app.use('/api/evaluaciones',         require('./routes/evaluaciones'))
app.use('/api/evaluaciones-insumo',  require('./routes/evaluacionesInsumo'))
app.use('/api/proveedores',          require('./routes/proveedores'))
app.use('/api/listado-proveedores',  require('./routes/listadoProveedores'))

// Servir frontend en producción
const distPath = path.join(__dirname, '../frontend/dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor en puerto ${PORT}`))
