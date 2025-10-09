import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminRegister.css'

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setErrorMessage('Nome de usuário é obrigatório')
      return false
    }
    if (!formData.email.trim()) {
      setErrorMessage('E-mail é obrigatório')
      return false
    }
    if (!formData.password.trim()) {
      setErrorMessage('Senha é obrigatória')
      return false
    }
    if (formData.password.length < 6) {
      setErrorMessage('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Senhas não coincidem')
      return false
    }
    if (!formData.full_name.trim()) {
      setErrorMessage('Nome completo é obrigatório')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setErrorMessage('')

      const adminData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      }

      console.log('Dados do administrador:', adminData)

      const res = await fetch('http://127.0.0.1:8000/admin-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erro ao cadastrar administrador')
      }

      alert('Cadastro de administrador realizado com sucesso! Você já pode fazer login.')
      navigate('/login')
    } catch (error) {
      console.error('Erro no cadastro:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao realizar cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-register-container">
      <div className="admin-register-card">
        <div className="register-header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="logo-text">Chamados ADMIN</span>
          </div>
          <h1>Cadastro de Administrador</h1>
          <p>Preencha os dados para criar sua conta de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Nome de Usuário *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite seu nome de usuário"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Nome Completo *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha (mínimo 6 caracteres)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              required
            />
          </div>


          {errorMessage && (
            <div className="error-message">
              ❌ {errorMessage}
            </div>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Administrador'}
          </button>
        </form>

        <div className="register-links">
          <p>
            Já tem uma conta?{' '}
            <a href="/login">Faça login</a>
          </p>
          <p className="back-link">
            <a href="/login">← Voltar ao login</a>
          </p>
        </div>
      </div>
    </div>
  )
}
