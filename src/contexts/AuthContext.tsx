import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: 'user' | 'technician' | 'admin'
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isTechnician: boolean
  isAdmin: boolean
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

  const isAuthenticated = !!token && !!user
  const isTechnician = user?.role === 'technician' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

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
    const fetchUserInfo = async () => {
      if (token && !user) {
        try {
          const res = await fetch('http://127.0.0.1:8000/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (res.ok) {
            const userData = await res.json()
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } else {
            logout()
          }
        } catch (error) {
          console.error('Erro ao buscar informações do usuário:', error)
          logout()
        }
      } else if (!token && user) {
        setUser(null)
      }
    }

    // Tenta recuperar dados do localStorage primeiro
    const savedUser = localStorage.getItem('user')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error)
        localStorage.removeItem('user')
      }
    }

    fetchUserInfo()
  }, [token, user])

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isTechnician,
    isAdmin
  }

  console.log('🔍 AuthContext estado:', { user, token, isAuthenticated, isTechnician, isAdmin })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}