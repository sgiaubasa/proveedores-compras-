import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Panel from './pages/Panel'
import NuevaEvaluacion from './pages/NuevaEvaluacion'
import NuevoInsumo from './pages/NuevoInsumo'
import Historial from './pages/Historial'
import HistorialInsumos from './pages/HistorialInsumos'
import EspecTecnicas from './pages/EspecTecnicas'
import AltaProveedor from './pages/AltaProveedor'
import Usuarios from './pages/Usuarios'
import ListadoProveedores from './pages/ListadoProveedores'
import ListadoProveedoresEditar from './pages/ListadoProveedoresEditar'

function ProtectedRoute({ children, roles }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />
  return children
}

function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <NavBar />
      <main className="ml-56 flex-1 min-h-screen">{children}</main>
    </div>
  )
}

function AppRoutes() {
  const { usuario } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />

      <Route path="/" element={<ProtectedRoute><Layout><Panel /></Layout></ProtectedRoute>} />

      <Route path="/evaluacion" element={
        <ProtectedRoute roles={['admin','evaluador_tecnico','evaluador_compras']}>
          <Layout><NuevaEvaluacion /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/evaluacion-insumo" element={
        <ProtectedRoute roles={['admin','evaluador_compras']}>
          <Layout><NuevoInsumo /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/historial" element={<ProtectedRoute><Layout><Historial /></Layout></ProtectedRoute>} />
      <Route path="/historial-insumos" element={<ProtectedRoute><Layout><HistorialInsumos /></Layout></ProtectedRoute>} />

      <Route path="/especificaciones" element={<ProtectedRoute><Layout><EspecTecnicas /></Layout></ProtectedRoute>} />

      <Route path="/especificaciones/nueva" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><AltaProveedor /></Layout>
        </ProtectedRoute>
      } />

      {/* Editar ET en misma revisión */}
      <Route path="/especificaciones/editar/:id" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><AltaProveedor /></Layout>
        </ProtectedRoute>
      } />

      {/* Crear nueva revisión de ET */}
      <Route path="/especificaciones/revision/:id" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><AltaProveedor /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/usuarios" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><Usuarios /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/listado-proveedores" element={
        <ProtectedRoute><Layout><ListadoProveedores /></Layout></ProtectedRoute>
      } />
      <Route path="/listado-proveedores/:sector" element={
        <ProtectedRoute roles={['admin','evaluador_compras']}>
          <Layout><ListadoProveedoresEditar /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
