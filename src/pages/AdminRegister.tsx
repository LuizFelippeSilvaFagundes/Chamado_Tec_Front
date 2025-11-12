import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import { getApiUrl } from '../api/api'
import './AdminRegister.css'

export default function AdminRegister() {
  const { showError: showErrorToast, showSuccess: showSuccessToast } = useToast()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  const [loading, setLoading] = useState(false)
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
      showErrorToast('Nome de usuário é obrigatório')
      return false
    }
    if (!formData.email.trim()) {
      showErrorToast('E-mail é obrigatório')
      return false
    }
    if (!formData.password.trim()) {
      showErrorToast('Senha é obrigatória')
      return false
    }
    if (formData.password.length < 6) {
      showErrorToast('Senha deve ter pelo menos 6 caracteres')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      showErrorToast('Senhas não coincidem')
      return false
    }
    if (!formData.full_name.trim()) {
      showErrorToast('Nome completo é obrigatório')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)

      const adminData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      }

      console.log('Dados do administrador:', adminData)

      const res = await fetch(`${getApiUrl()}/admin-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = handleApiError({ ...errorData, status: res.status })
        throw new Error(errorMessage)
      }

      showSuccessToast('Cadastro de administrador realizado com sucesso! Você já pode fazer login.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      console.error('Erro no cadastro:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(errorMessage)
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
