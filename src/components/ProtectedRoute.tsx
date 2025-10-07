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
  const { user } = useAuth()
  const location = useLocation()

  console.log('🔒 ProtectedRoute verificação:', { 
    userRole: user?.role, 
    requireTechnician,
    requireAdmin,
    currentPath: location.pathname 
  })

  // Se não há usuário logado, redireciona para login
  if (!user) {
    console.log('❌ Usuário não encontrado, redirecionando para login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isTechnician = user.role === 'technician' || user.role === 'admin'
  const isAdmin = user.role === 'admin'

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
