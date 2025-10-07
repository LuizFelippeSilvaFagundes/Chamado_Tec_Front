import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../components/Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setErrorMessage('Informe seu usuário.')
      return
    }
    if (!password.trim()) {
      setErrorMessage('Informe sua senha.')
      return
    }

    try {
      console.log('🔐 Tentativa de login:', { username, password })
      
      const res = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        let msg = 'Erro ao fazer login'
        try {
          const data = await res.json()
          if (typeof data?.detail === 'string') msg = data.detail
          else if (Array.isArray(data?.detail)) msg = data.detail.map((d: any) => d?.msg || d?.detail || JSON.stringify(d)).join(' | ')
          else if (data) msg = JSON.stringify(data)
        } catch {}
        throw new Error(msg)
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
        const userRes = await fetch('http://127.0.0.1:8000/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        })

        if (!userRes.ok) {
          throw new Error('Erro ao buscar informações do usuário')
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
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao fazer login')
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
          {errorMessage && (
            <div className="error-message">
              ❌ {errorMessage}
            </div>
          )}
          <button type="submit">Entrar</button>
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
