import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: 'user' | 'technician' | 'admin'
  is_active: boolean
  avatar_url?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  const login = (newToken: string, userData: User) => {
    console.log('🔐 AuthContext: Fazendo login com:', { newToken: newToken.substring(0, 20) + '...', userData })
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    console.log('✅ AuthContext: Login realizado com sucesso')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  useEffect(() => {
    // Tenta recuperar dados do localStorage primeiro
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        console.log('✅ Usuário recuperado do localStorage:', userData.username)
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    login,
    logout
  }

  console.log('🔍 AuthContext estado:', { user, token })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}