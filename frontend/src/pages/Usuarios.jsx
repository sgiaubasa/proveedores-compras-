import { useEffect, useState } from 'react'
import api from '../api'

const ROLES  = ['admin','evaluador_tecnico','evaluador_compras','lectura']
const AREAS  = ['GO','GC','CAE','Compras','SAV','JAV','CCM','SGI','Otro']
const ROL_LABELS = {
  admin: 'Administrador',
  evaluador_tecnico: 'Evaluador Técnico',
  evaluador_compras: 'Evaluador Compras',
  lectura: 'Solo lectura'
}

const FORM_VACIO = {
  nombre: '', email: '', password: '', rol: 'evaluador_compras', area: 'Compras', etIdsPermitidos: []
}

export default function Usuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [ets, setEts]             = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)       // 'crear' | 'editar' | false
  const [usuarioEdit, setUsuarioEdit] = useState(null)
  const [form, setForm]           = useState(FORM_VACIO)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const [cambiarPass, setCambiarPass] = useState(false)
  const [nuevaPass, setNuevaPass] = useState('')

  const cargar = () => {
    setLoading(true)
    Promise.all([
      api.get('/usuarios'),
      api.get('/espec-tecnicas')
    ]).then(([ru, ret]) => {
      setUsuarios(ru.data)
      setEts(ret.data)
    }).finally(() => setLoading(false))
  }
  useEffect(cargar, [])

  const abrirCrear = () => {
    setForm(FORM_VACIO)
    setError(null)
    setModal('crear')
  }

  const abrirEditar = u => {
    setUsuarioEdit(u)
    setForm({
      nombre:           u.nombre,
      email:            u.email,
      password:         '',
      rol:              u.rol,
      area:             u.area || '',
      etIdsPermitidos:  u.etIdsPermitidos?.map(e => e._id || e) || []
    })
    setCambiarPass(false)
    setNuevaPass('')
    setError(null)
    setModal('editar')
  }

  const toggleEt = etId => {
    setForm(f => ({
      ...f,
      etIdsPermitidos: f.etIdsPermitidos.includes(etId)
        ? f.etIdsPermitidos.filter(id => id !== etId)
        : [...f.etIdsPermitidos, etId]
    }))
  }

  const seleccionarTodas = () => setForm(f => ({ ...f, etIdsPermitidos: ets.map(e => e._id) }))
  const deseleccionarTodas = () => setForm(f => ({ ...f, etIdsPermitidos: [] }))

  const handleCrear = async e => {
    e.preventDefault()
    if (!form.nombre || !form.email || !form.password)
      return setError('Nombre, email y contraseña son obligatorios')
    setSaving(true)
    setError(null)
    try {
      await api.post('/usuarios', form)
      setModal(false)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear')
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = async e => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        nombre:          form.nombre,
        rol:             form.rol,
        area:            form.area,
        etIdsPermitidos: form.etIdsPermitidos
      }
      if (cambiarPass) {
        if (!nuevaPass) return setError('Ingresá la nueva contraseña')
        payload.password = nuevaPass
      }
      await api.patch(`/usuarios/${usuarioEdit._id}`, payload)
      setModal(false)
      cargar()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const cambiarActivo = async (id, activo) => {
    await api.patch(`/usuarios/${id}`, { activo })
    cargar()
  }

  const etLabel = et => `${et.codigo} — ${et.nombre}`

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button onClick={abrirCrear}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          + Nuevo usuario
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando…</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Área</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ETs asignadas</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u._id} className={`border-b border-gray-100 hover:bg-gray-50 ${!u.activo ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{u.nombre}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.rol === 'admin' ? 'bg-purple-50 text-purple-700' :
                      u.rol === 'evaluador_tecnico' ? 'bg-teal-50 text-teal-700' :
                      u.rol === 'evaluador_compras' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ROL_LABELS[u.rol]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.area || '—'}</td>
                  <td className="px-4 py-3">
                    {u.rol === 'admin' ? (
                      <span className="text-xs text-gray-400 italic">Todas</span>
                    ) : u.etIdsPermitidos?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.etIdsPermitidos.map(et => (
                          <span key={et._id} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                            {et.codigo}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600">Sin ETs asignadas</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => cambiarActivo(u._id, !u.activo)}
                      className={`px-2 py-1 text-xs rounded-full font-medium cursor-pointer ${u.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => abrirEditar(u)}
                      className="text-xs text-blue-600 hover:underline">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear / editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-lg font-bold">
                {modal === 'crear' ? 'Nuevo usuario' : `Editar: ${usuarioEdit?.nombre}`}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>

            <form onSubmit={modal === 'crear' ? handleCrear : handleEditar} className="p-5 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

              {/* Datos básicos */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Datos del usuario</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                    <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" value={form.email}
                      onChange={e => setForm(f => ({...f, email: e.target.value}))}
                      disabled={modal === 'editar'}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:text-gray-500" />
                  </div>
                </div>

                {/* Contraseña */}
                {modal === 'crear' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                    <input type="password" value={form.password}
                      onChange={e => setForm(f => ({...f, password: e.target.value}))} required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={cambiarPass} onChange={e => setCambiarPass(e.target.checked)} />
                      Cambiar contraseña
                    </label>
                    {cambiarPass && (
                      <input type="password" value={nuevaPass} onChange={e => setNuevaPass(e.target.value)}
                        placeholder="Nueva contraseña"
                        className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select value={form.rol} onChange={e => setForm(f => ({...f, rol: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                      {ROLES.map(r => <option key={r} value={r}>{ROL_LABELS[r]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                    <select value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                      <option value="">Sin área</option>
                      {AREAS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Asignación de ETs */}
              {form.rol !== 'admin' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Proveedores que puede evaluar
                    </h3>
                    <div className="flex gap-3">
                      <button type="button" onClick={seleccionarTodas} className="text-xs text-blue-600 hover:underline">Todas</button>
                      <button type="button" onClick={deseleccionarTodas} className="text-xs text-gray-500 hover:underline">Ninguna</button>
                    </div>
                  </div>

                  {form.etIdsPermitidos.length === 0 && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Sin ETs seleccionadas — el usuario no podrá evaluar ningún proveedor.
                    </p>
                  )}

                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
                    {ets.map(et => (
                      <label key={et._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.etIdsPermitidos.includes(et._id)}
                          onChange={() => toggleEt(et._id)}
                          className="rounded accent-blue-600"
                        />
                        <span className="font-mono text-blue-700 text-sm font-semibold w-16 shrink-0">{et.codigo}</span>
                        <span className="text-sm text-gray-800">{et.nombre}</span>
                        <span className="text-xs text-gray-400 ml-auto shrink-0">{et.proveedorNombre}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {form.etIdsPermitidos.length} de {ets.length} seleccionadas
                  </p>
                </div>
              )}

              {form.rol === 'admin' && (
                <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  Los administradores tienen acceso a todas las ETs automáticamente.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? 'Guardando…' : modal === 'crear' ? 'Crear usuario' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
