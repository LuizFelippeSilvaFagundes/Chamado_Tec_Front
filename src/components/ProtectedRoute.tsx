import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireTechnician?: boolean
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireTechnician = false,
  requireAdmin = false
}) => {
  const { isAuthenticated, isTechnician, isAdmin, user } = useAuth()
  const location = useLocation()

  console.log('🔒 ProtectedRoute verificação:', { 
    isAuthenticated, 
    isTechnician, 
    isAdmin,
    userRole: user?.role, 
    requireTechnician,
    requireAdmin,
    currentPath: location.pathname 
  })

  if (!isAuthenticated) {
    console.log('❌ Usuário não autenticado, redirecionando para login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    // Se não for admin, redireciona para o dashboard apropriado
    if (isTechnician) {
      return <Navigate to="/tech-dashboard" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  if (requireTechnician && !isTechnician && !isAdmin) {
    // Se não for técnico nem admin, redireciona para o dashboard de usuário
    return <Navigate to="/dashboard" replace />
  }

  if (!requireTechnician && !requireAdmin && (isTechnician || isAdmin)) {
    // Se for técnico ou admin mas tentar acessar dashboard de usuário, redireciona para dashboard apropriado
    if (isAdmin) {
      return <Navigate to="/admin-dashboard" replace />
    }
    return <Navigate to="/tech-dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
