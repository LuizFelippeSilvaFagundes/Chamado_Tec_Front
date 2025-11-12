import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import { getApiUrl } from '../api/api'
import '../components/Login.css'

export default function Register() {
  const navigate = useNavigate()
  const { showError: showErrorToast, showSuccess: showSuccessToast } = useToast()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validatePassword = (password: string) => {
    return password.length >= 6 
  }

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      showErrorToast('Informe seu nome de usuário.')
      return
    }
    if (username.trim().length < 3) {
      showErrorToast('Nome de usuário deve ter pelo menos 3 caracteres.')
      return
    }
    if (!phone.trim()) {
      showErrorToast('Informe seu telefone.')
      return
    }
    if (!fullName.trim()) {
      showErrorToast('Informe seu nome completo.')
      return
    }
    if (!validatePhone(phone)) {
      showErrorToast('Informe um telefone válido (mín. 8 dígitos).')
      return
    }
    if (!password.trim()) {
      showErrorToast('Informe sua senha.')
      return
    }
    if (!validatePassword(password)) {
      showErrorToast('Senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      showErrorToast('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`${getApiUrl()}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          full_name: fullName,
          phone: phone.replace(/\D/g, ''),
          password
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = handleApiError({ ...errorData, status: res.status })
        throw new Error(errorMessage)
      }

      showSuccessToast('Usuário registrado com sucesso! Redirecionando para login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      console.error('Erro no registro:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card register-card">
        <h2>Cadastro</h2>
        
        <form onSubmit={handleSubmit}>
          <label>
            Nome de Usuário
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de usuário"
              required
              disabled={isSubmitting}
            />
          </label>
          <label>
            Nome Completo
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              required
              disabled={isSubmitting}
            />
          </label>
          
          <label>
            Telefone
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </label>

          <label>
            Confirmar Senha
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
              disabled={isSubmitting}
            />
          </label>


          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Registrando...' : 'Criar Conta'}
          </button>
        </form>
        
        <p>
          Já tem uma conta?{' '}
          <a href="/login">Faça login</a>
        </p>
      </div>
    </div>
  )
}
