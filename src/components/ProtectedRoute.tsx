import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  requireTechnician?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireTechnician = false 
}) => {
  const { isAuthenticated, isTechnician, user } = useAuth()
  const location = useLocation()

  console.log('🔒 ProtectedRoute verificação:', { 
    isAuthenticated, 
    isTechnician, 
    userRole: user?.role, 
    requireTechnician,
    currentPath: location.pathname 
  })

  if (!isAuthenticated) {
    console.log('❌ Usuário não autenticado, redirecionando para login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireTechnician && !isTechnician) {
    // Se não for técnico, redireciona para o dashboard de usuário
    return <Navigate to="/dashboard" replace />
  }

  if (!requireTechnician && isTechnician) {
    // Se for técnico mas tentar acessar dashboard de usuário, redireciona para tech dashboard
    return <Navigate to="/tech-dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
