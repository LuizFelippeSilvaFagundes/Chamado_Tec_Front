import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import { getApiUrl } from '../api/api'
import '../components/TechRegister.css'

export default function TechRegister() {
  const { showError: showErrorToast, showSuccess: showSuccessToast } = useToast()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    employee_id: '',
    department: '',
    specialty: [] as string[],
    phone: '',
    emergency_contact: '',
    certifications: '',
    experience_years: '',
    availability: 'full-time' as 'full-time' | 'part-time' | 'on-call',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const specialties = [
    'Hardware',
    'Software',
    'Rede',
    'Servidores',
    'Impressoras',
    'Telefonia',
    'Segurança',
    'Backup',
    'Virtualização',
    'Cloud Computing'
  ]

  const departments = [
    'TI - Administração',
    'TI - Suporte',
    'TI - Infraestrutura',
    'TI - Desenvolvimento',
    'TI - Segurança',
    'TI - Redes'
  ]

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialty: prev.specialty.includes(specialty)
        ? prev.specialty.filter(s => s !== specialty)
        : [...prev.specialty, specialty]
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      showErrorToast('Nome de usuário é obrigatório.')
      return false
    }
    if (!formData.email.trim()) {
      showErrorToast('E-mail é obrigatório.')
      return false
    }
    if (!formData.password.trim()) {
      showErrorToast('Senha é obrigatória.')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      showErrorToast('As senhas não coincidem.')
      return false
    }
    if (formData.password.length < 6) {
      showErrorToast('A senha deve ter pelo menos 6 caracteres.')
      return false
    }
    if (!formData.full_name.trim()) {
      showErrorToast('Nome completo é obrigatório.')
      return false
    }
    if (!formData.employee_id.trim()) {
      showErrorToast('ID do funcionário é obrigatório.')
      return false
    }
    if (!formData.department) {
      showErrorToast('Departamento é obrigatório.')
      return false
    }
    if (formData.specialty.length === 0) {
      showErrorToast('Selecione pelo menos uma especialidade.')
      return false
    }
    if (!formData.phone.trim()) {
      showErrorToast('Telefone é obrigatório.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)

      const techData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: 'technician',
        employee_id: formData.employee_id,
        department: formData.department,
        specialty: formData.specialty,
        phone: formData.phone
      }

      console.log('Dados do técnico:', techData)

      const res = await fetch(`${getApiUrl()}/tech-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(techData),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage = handleApiError({ ...errorData, status: res.status })
        throw new Error(errorMessage)
      }

      showSuccessToast('Cadastro realizado com sucesso! Você já pode fazer login como técnico.')
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
    <div className="tech-register-container">
      <div className="tech-register-card">
        <div className="register-header">
          <h2>🔧 Cadastro de Técnico</h2>
          <p>Preencha os dados abaixo para solicitar acesso como técnico</p>
        </div>
        
        <form onSubmit={handleSubmit} className="tech-register-form">
          {/* Informações Básicas */}
          <div className="form-section">
            <h3>👤 Informações Pessoais</h3>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Nome de Usuário *
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Seu nome de usuário"
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  E-mail *
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu.email@empresa.com"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Senha *
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Confirmar Senha *
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Digite a senha novamente"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Nome Completo *
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  ID do Funcionário *
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    placeholder="Ex: 12345"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Telefone *
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Contato de Emergência
                  <input
                    type="tel"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="form-section">
            <h3>💼 Informações Profissionais</h3>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Departamento *
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione o departamento</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-group">
                <label>
                  Anos de Experiência
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    placeholder="Ex: 5"
                    min="0"
                    max="50"
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>
                Especialidades * (selecione pelo menos uma)
                <div className="specialties-grid">
                  {specialties.map(specialty => (
                    <label key={specialty} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.specialty.includes(specialty)}
                        onChange={() => handleSpecialtyChange(specialty)}
                      />
                      <span>{specialty}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                Disponibilidade
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                >
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="on-call">Plantão</option>
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                Certificações
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  placeholder="Liste suas certificações (ex: CCNA, ITIL, AWS, etc.)"
                  rows={3}
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Observações Adicionais
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Informações adicionais relevantes..."
                  rows={3}
                />
              </label>
            </div>
          </div>


          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? '⏳ Cadastrando...' : '🔧 Solicitar Cadastro'}
            </button>
            <button 
              type="button" 
              className="back-button"
              onClick={() => navigate('/login')}
            >
              ← Voltar ao Login
            </button>
          </div>

          <div className="register-info">
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Após o cadastro, você poderá fazer login imediatamente</li>
              <li>Campos marcados com * são obrigatórios</li>
              <li>Mantenha suas informações atualizadas</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}
