import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import { getApiUrl } from '../api/api'
import '../components/Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showError: showErrorToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      showErrorToast('Informe seu usuário.')
      return
    }
    if (!password.trim()) {
      showErrorToast('Informe sua senha.')
      return
    }

    setIsLoading(true)

    try {
      console.log('🔐 Tentativa de login:', { username, password })
      
      const res = await fetch(`${getApiUrl()}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const errorMessage = handleApiError({ ...data, status: res.status })
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('✅ Token recebido:', data)
      
      let userData
      
      // Se o backend já retorna os dados do usuário na resposta do login
      if (data.user) {
        console.log('✅ Dados do usuário já incluídos:', data.user)
        userData = data.user
        login(data.access_token, userData)
      } else {
        // Se não, busca os dados do usuário separadamente
        const userRes = await fetch(`${getApiUrl()}/me`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        })

        if (!userRes.ok) {
          const errorData = await userRes.json().catch(() => ({}))
          const errorMessage = handleApiError(errorData)
          throw new Error(errorMessage)
        }

        userData = await userRes.json()
        console.log('✅ Dados do usuário:', userData)
        login(data.access_token, userData)
      }
      
      console.log('🔄 Redirecionando usuário:', userData.role)
      
      // Usar setTimeout para garantir que o estado seja atualizado antes do redirecionamento
      setTimeout(() => {
        if (userData.role === 'admin') {
          console.log('➡️ Redirecionando para admin-dashboard')
          navigate('/admin-dashboard')
        } else if (userData.role === 'technician') {
          console.log('➡️ Redirecionando para tech-dashboard')
          navigate('/tech-dashboard')
        } else {
          console.log('➡️ Redirecionando para dashboard')
          navigate('/dashboard')
        }
      }, 100)
    } catch (error) {
      console.error('Erro no login:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Usuário
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu usuário"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="login-links">
          <p>
            Não tem uma conta?{' '}
            <a href="/register">Registre-se</a>
          </p>
          <p className="tech-link">
            É técnico?{' '}
            <a href="/tech-register">Solicite acesso técnico</a>
          </p>
          <p className="admin-link">
            É administrador?{' '}
            <a href="/admin-register">Cadastre-se como admin</a>
          </p>
        </div>
      </div>
    </div>
  )
}
