const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
const path     = require('path')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err))

app.use('/api/auth',                 require('./routes/auth'))
app.use('/api/usuarios',             require('./routes/usuarios'))
app.use('/api/espec-tecnicas',       require('./routes/especTecnicas'))
app.use('/api/evaluaciones',         require('./routes/evaluaciones'))
app.use('/api/evaluaciones-insumo',  require('./routes/evaluacionesInsumo'))
app.use('/api/proveedores',          require('./routes/proveedores'))

// Servir frontend en producción
const distPath = path.join(__dirname, '../frontend/dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor en puerto ${PORT}`))
