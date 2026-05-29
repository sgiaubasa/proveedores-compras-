const nodemailer = require('nodemailer')

// Configuración del transporte — se lee de .env
// Variables necesarias en .env:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=tucuenta@gmail.com
//   SMTP_PASS=tu_app_password
//   APP_URL=https://tu-app.onrender.com  (o http://localhost:5173 en dev)

function crearTransporte() {
  // Si no hay config SMTP, usar cuenta de prueba Ethereal (solo logs, no llega)
  if (!process.env.SMTP_HOST) {
    console.warn('[mailer] Sin SMTP configurado — el token se mostrará en consola')
    return null
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function enviarResetPassword(email, nombre, token) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173'
  const link   = `${appUrl}/reset-password/${token}`

  const transporte = crearTransporte()

  if (!transporte) {
    // Fallback: mostrar en consola (útil en desarrollo o sin email configurado)
    console.log('\n===== LINK DE RESET DE CONTRASEÑA =====')
    console.log(`Para: ${email}`)
    console.log(`Link: ${link}`)
    console.log('(Válido por 1 hora)')
    console.log('========================================\n')
    return { modo: 'consola' }
  }

  await transporte.sendMail({
    from:    `"AUBASA Proveedores" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Restablecer contraseña — AUBASA',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1d4ed8">Restablecer contraseña</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña del sistema de evaluación de proveedores.</p>
        <p style="margin:24px 0">
          <a href="${link}"
             style="background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Restablecer contraseña
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">
          Este link es válido por <strong>1 hora</strong>.<br>
          Si no solicitaste este cambio, podés ignorar este correo.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px">AUBASA · Sistema de Evaluación de Proveedores</p>
      </div>
    `
  })
  return { modo: 'email' }
}

module.exports = { enviarResetPassword }
