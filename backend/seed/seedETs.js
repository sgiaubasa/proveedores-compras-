const mongoose     = require('mongoose')
const bcrypt       = require('bcryptjs')
const EspecTecnica = require('../models/EspecTecnica')
const Usuario      = require('../models/Usuario')
require('dotenv').config()

// Ponderaciones extraídas del Excel real de AUBASA (SUM 2025)
const ETS = [
  {
    codigo: 'ET-PS-01', revision: '00',
    nombre: 'Primeros Auxilios y Transporte Sanitario',
    proveedorNombre: 'SUM S.A.',
    area_tecnica: 'SAV',
    frecuencia: 'trimestral',
    fecha_vigencia: '21.Ene.2019',
    items: [
      { n:1, descripcion:'Habilitación de la Ambulancia',
        criterio:'Conforme Decreto 3280/90 – Dirección de Fiscalización Sanitaria – PBA',
        ponderacion: 0.20, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:2, descripcion:'Seguros',
        criterio:'Seguro del vehículo, pacientes transportados y terceros. ART, Seguro Colectivo de Vida y Mala Praxis Médica.',
        ponderacion: 0.15, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:3, descripcion:'Equipamiento',
        criterio:'Elementos de atención primaria de heridos y asistencia respiratoria mecánica. Listado de medicamentos y descartables.',
        ponderacion: 0.15, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:4, descripcion:'Personal',
        criterio:'Título habilitante de personal médico. Matrícula Colegio de Médicos PBA.',
        ponderacion: 0.10, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:5, descripcion:'Condiciones generales de la unidad',
        criterio:'Limpieza y operación. Verificación técnica cada 6 meses con ficha (RTO, etc.).',
        ponderacion: 0.15, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:6, descripcion:'Disposición de residuos patológicos',
        criterio:'Conforme Ley PBA 11720, Dec. 450/94 y 403/97. Presentación de DDJJ Anual.',
        ponderacion: 0.15, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:7, descripcion:'Cumplimiento del servicio',
        criterio:'Prestación del servicio conforme condiciones contratadas.',
        ponderacion: 0.10, resp_compras:['a'], resp_tecnica:['d'] }
    ]
  },
  {
    codigo: 'ET-PS-02', revision: '00',
    nombre: 'Telefonía Fija y Línea 0800',
    proveedorNombre: 'Telefónica de Argentina',
    area_tecnica: 'Jefe Front Office / Jefe CCM',
    frecuencia: 'trimestral',
    fecha_vigencia: '21.Ene.2019',
    items: [
      { n:1, descripcion:'Disponibilidad del servicio (no interrupción)',
        criterio:'Cantidad de No Conformidades por interrupción del servicio.',
        ponderacion: 0.40, resp_compras:[], resp_tecnica:['d'] },
      { n:2, descripcion:'Calidad de las comunicaciones',
        criterio:'Cantidad de No Conformidades por baja calidad de comunicación.',
        ponderacion: 0.35, resp_compras:[], resp_tecnica:['d'] },
      { n:3, descripcion:'Operatividad del servicio',
        criterio:'Respuesta dentro de las 24 hs de efectuado el reclamo.',
        ponderacion: 0.25, resp_compras:[], resp_tecnica:['d'] }
    ]
  },
  {
    codigo: 'ET-PS-03', revision: '00',
    nombre: 'Auxilio Mecánico – Vehículos Livianos',
    proveedorNombre: 'Edgardo Alberto Vazquez',
    area_tecnica: 'JAV',
    frecuencia: 'trimestral',
    fecha_vigencia: '21.Ene.2019',
    items: [
      { n:1, descripcion:'Unidad prestadora del servicio',
        criterio:'Verificación técnica vehicular y seguros vigentes conforme condiciones generales de OC.',
        ponderacion: 0.30, resp_compras:['i','a'], resp_tecnica:['ins'] },
      { n:2, descripcion:'Elementos básicos de auxilio mecánico',
        criterio:'Disposición y condiciones operativas.',
        ponderacion: 0.25, resp_compras:['i','a'], resp_tecnica:['ins'] },
      { n:3, descripcion:'Elementos de seguridad vial',
        criterio:'Cantidad y condiciones operativas.',
        ponderacion: 0.25, resp_compras:['i','a'], resp_tecnica:['ins'] },
      { n:4, descripcion:'Conformidad del usuario',
        criterio:'Índice general de satisfacción de usuarios ≥ 95%.',
        ponderacion: 0.20, resp_compras:['a'], resp_tecnica:['ins'] }
    ]
  },
  {
    codigo: 'ET-PS-04', revision: '00',
    nombre: 'Auxilio Mecánico – Grúa Gran Porte (>4500 kg)',
    proveedorNombre: 'Edgardo Alberto Vazquez',
    area_tecnica: 'JAV',
    frecuencia: 'trimestral',
    fecha_vigencia: '21.Ene.2019',
    items: [
      { n:1, descripcion:'Unidad prestadora del servicio',
        criterio:'Verificación técnica vehicular y seguros vigentes conforme condiciones generales de OC.',
        ponderacion: 0.30, resp_compras:['i','a'], resp_tecnica:['ins'] },
      { n:2, descripcion:'Elementos básicos de auxilio mecánico',
        criterio:'Disposición y condiciones operativas.',
        ponderacion: 0.25, resp_compras:['i','a'], resp_tecnica:['ins'] },
      { n:3, descripcion:'Elementos de seguridad vial',
        criterio:'Cantidad y condiciones operativas.',
        ponderacion: 0.25, resp_compras:['i','a'], resp_tecnica:['ins'] },
      { n:4, descripcion:'Conformidad del usuario',
        criterio:'Índice general de satisfacción de usuarios ≥ 95%.',
        ponderacion: 0.20, resp_compras:['a'], resp_tecnica:['ins'] }
    ]
  },
  {
    codigo: 'ET-PS-05', revision: '00',
    nombre: 'Telefonía Celular *288',
    proveedorNombre: '(pendiente asignar)',
    area_tecnica: 'Jefe CCM / Área Compras',
    frecuencia: 'trimestral',
    fecha_vigencia: '21.Ene.2019',
    items: [
      { n:1, descripcion:'Disponibilidad del servicio (no interrupción)',
        criterio:'Cantidad de No Conformidades por interrupción.',
        ponderacion: 0.40, resp_compras:['a'], resp_tecnica:['d'] },
      { n:2, descripcion:'Calidad de comunicaciones en área de concesión',
        criterio:'Cantidad de No Conformidades por baja señal o calidad de comunicación.',
        ponderacion: 0.35, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:3, descripcion:'Operatividad del servicio solicitado',
        criterio:'Respuesta dentro de las 24 hs de efectuado el reclamo.',
        ponderacion: 0.25, resp_compras:['a'], resp_tecnica:['d'] }
    ]
  },
  {
    codigo: 'ET-PS-06', revision: '00',
    nombre: 'Mantenimiento de Controladores Fiscales',
    proveedorNombre: 'HASAR',
    area_tecnica: 'Jefe de Estación',
    frecuencia: 'trimestral',
    fecha_vigencia: '21.Ene.2019',
    items: [
      { n:1, descripcion:'Antecedentes',
        criterio:'Inscripto en Registro AFIP para empresas de reparación y mantenimiento de controladores fiscales homologados.',
        ponderacion: 0.10, resp_compras:['i'], resp_tecnica:[] },
      { n:2, descripcion:'Capacidad técnica',
        criterio:'Infraestructura edilicia, laboratorio y RR.HH. adecuados.',
        ponderacion: 0.20, resp_compras:['i'], resp_tecnica:[] },
      { n:3, descripcion:'Seguros',
        criterio:'Certificado ART con nómina y cláusula de no repetición a favor de AUBASA.',
        ponderacion: 0.20, resp_compras:['i','a'], resp_tecnica:['d'] },
      { n:4, descripcion:'Eficacia del servicio',
        criterio:'Cumplimiento mantenimiento mensual programado ≥ 97%. Reparaciones en taller: entrega ≤ 30 días.',
        ponderacion: 0.30, resp_compras:['a'], resp_tecnica:['d'] },
      { n:5, descripcion:'Eficiencia de las reparaciones',
        criterio:'No se reportan fallas sobre el mismo ítem reparado en un período ≤ 3 meses.',
        ponderacion: 0.20, resp_compras:['a'], resp_tecnica:['d'] }
    ]
  },
  {
    codigo: 'ET-PS-07', revision: '01',
    nombre: 'Servicio de Traslado de Personal (Remis)',
    proveedorNombre: 'REMIS ON TIME',
    area_tecnica: 'CCM',
    frecuencia: 'trimestral',
    fecha_vigencia: '06.Sep.2018',
    items: [
      { n:1,  descripcion:'Agencia',
        criterio:'AFIP – Inscripción vigente. Inscripción como proveedor del Estado Provincial.',
        ponderacion: 0.10, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:2,  descripcion:'Vehículo',
        criterio:'Estado exterior e interior (limpieza). Elementos de seguridad. VTV vigente.',
        ponderacion: 0.15, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:3,  descripcion:'Cédula verde',
        criterio:'Documentación correspondiente a cada unidad.',
        ponderacion: 0.10, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:4,  descripcion:'Seguros',
        criterio:'Accidentes conductor y terceros transportados. Seguro del rodado (cláusula no repetición AUBASA).',
        ponderacion: 0.15, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:5,  descripcion:'Licencia de conducir',
        criterio:'Documentación vigente. Categoría correspondiente al vehículo.',
        ponderacion: 0.10, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:6,  descripcion:'Disponibilidad de unidades',
        criterio:'Igual o superior a 15 unidades.',
        ponderacion: 0.15, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:7,  descripcion:'Separador interior conductor/pasajeros',
        criterio:'Material transparente en perfecto estado.',
        ponderacion: 0.05, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:8,  descripcion:'Alcohol en gel o spray',
        criterio:'Cada unidad con elementos de provisión individual para conductor y pasajeros.',
        ponderacion: 0.05, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:9,  descripcion:'EPP conductores',
        criterio:'Conductores deben usar tapa boca/barbijo de manera correcta.',
        ponderacion: 0.05, resp_compras:['i','a'], resp_tecnica:['d','ins'] },
      { n:10, descripcion:'Cumplimiento del servicio',
        criterio:'Prestación puntual y conforme a lo contratado.',
        ponderacion: 0.10, resp_compras:['i','a'], resp_tecnica:['d','ins'] }
    ]
  }
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB conectado')

  await EspecTecnica.deleteMany({})
  await EspecTecnica.insertMany(ETS)
  console.log('✓ 7 ETs cargadas con ponderaciones')

  const existe = await Usuario.findOne({ email: 'admin@aubasa.com' })
  if (!existe) {
    await Usuario.create({
      nombre:   'Administrador',
      email:    'admin@aubasa.com',
      password: 'admin123',
      rol:      'admin',
      area:     'SGI'
    })
    console.log('✓ Usuario admin creado  →  admin@aubasa.com / admin123')
  } else {
    console.log('ℹ  Usuario admin ya existe')
  }

  console.log('\n¡Listo! Servidor: npm run dev')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
