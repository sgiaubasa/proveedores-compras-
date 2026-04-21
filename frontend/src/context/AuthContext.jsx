import { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const stored = localStorage.getItem('usuario')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token',   data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      setUsuario(data.usuario)
    } catch (e) {
      const msg = e.response?.data?.error || 'Credenciales inválidas'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const tieneRol = (...roles) => roles.includes(usuario?.rol)

  // Devuelve true si el usuario puede evaluar la ET dada (por su _id)
  const puedeEvaluar = etId => {
    if (!usuario) return false
    if (usuario.rol === 'admin') return true
    const permitidos = usuario.etIdsPermitidos || []
    return permitidos.some(e => (e._id || e) === etId)
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, error, login, logout, tieneRol, puedeEvaluar }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
