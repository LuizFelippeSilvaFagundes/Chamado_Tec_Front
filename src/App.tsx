import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ToastProvider } from './contexts/ToastContext'
import Login from './pages/Login'
import Register from './pages/Register'
import TechRegister from './pages/TechRegister'
import AdminRegister from './pages/AdminRegister'
import UserDashboard from './pages/UserDashboard'
import TechDashboard from './pages/TechDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminTicketDetail from './pages/AdminTicketDetail'
import AdminTechnicianProfile from './pages/AdminTechnicianProfile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tech-register" element={<TechRegister />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tech-dashboard" element={
            <ProtectedRoute requireTechnician>
              <TechDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-ticket/:id" element={
            <ProtectedRoute requireAdmin>
              <AdminTicketDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin-technician/:id" element={
            <ProtectedRoute requireAdmin>
              <AdminTechnicianProfile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
