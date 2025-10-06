import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../components/Login.css'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
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
    setErrorMessage('')
    
    if (!phone.trim()) {
      setErrorMessage('Informe seu nome de usuário.')
      return
    }
    if (!fullName.trim()) {
      setErrorMessage('Informe seu nome completo.')
      return
    }
    if (!validatePhone(phone)) {
      setErrorMessage('Informe um telefone válido (mín. 8 dígitos).')
      return
    }
    if (!password.trim()) {
      setErrorMessage('Informe sua senha.')
      return
    }
    if (!validatePassword(password)) {
      setErrorMessage('Senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Backend atual espera username/email; aqui derivamos username do telefone
        // e enviamos um email placeholder baseado no telefone.
        body: JSON.stringify({
          username: phone.replace(/\D/g, ''),
          full_name: fullName,
          email: `${phone.replace(/\D/g, '')}@noemail.local`,
          password
        }),
      })

      if (!res.ok) {
        let msg = 'Erro ao registrar usuário'
        try {
          const data = await res.json()
          if (typeof data?.detail === 'string') msg = data.detail
          else if (Array.isArray(data?.detail)) msg = data.detail.map((d: any) => d?.msg || d?.detail || JSON.stringify(d)).join(' | ')
          else if (data) msg = JSON.stringify(data)
        } catch {}
        throw new Error(msg)
      }

      setSuccessMessage('Usuário registrado com sucesso! Redirecionando para login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      console.error('Erro no registro:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao registrar usuário')
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

          {errorMessage && (
            <div className="error-message">
              ❌ {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              textAlign: 'center',
              marginTop: '1rem',
              padding: '0.75rem',
              borderRadius: '8px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}>
              ✅ {successMessage}
            </div>
          )}

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
