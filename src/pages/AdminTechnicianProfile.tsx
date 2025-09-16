import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './AdminTechnicianProfile.css'

export default function AdminTechnicianProfile() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [technician, setTechnician] = useState<any>(null)
  const [technicianLoading, setTechnicianLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    availability: [] as string[]
  })

  useEffect(() => {
    if (id) {
      fetchTechnician()
    }
  }, [id])

  const fetchTechnician = async () => {
    try {
      setTechnicianLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const res = await fetch(`http://127.0.0.1:8000/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Erro ao buscar técnico')
      }

      const data = await res.json()
      console.log('👤 Técnico recebido pela API:', data)
      
      setTechnician(data)
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        password: '',
        availability: data.availability ? data.availability.split(',') : []
      })
    } catch (error) {
      console.error('Erro ao buscar técnico:', error)
      // Fallback para dados mockados
      setTechnician({
        id: 1,
        full_name: 'Carlos Silva',
        email: 'carlos.silva@test.com',
        availability: '08:00,09:00,10:00,11:00,12:00,13:00,14:00,15:00,16:00,17:00'
      })
      setFormData({
        full_name: 'Carlos Silva',
        email: 'carlos.silva@test.com',
        password: '',
        availability: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
      })
    } finally {
      setTechnicianLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTimeSlotToggle = (timeSlot: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(timeSlot)
        ? prev.availability.filter(slot => slot !== timeSlot)
        : [...prev.availability, timeSlot]
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        availability: formData.availability.join(',')
      }

      // Se senha foi preenchida, incluir na atualização
      if (formData.password.trim()) {
        updateData.password = formData.password
      }

      const res = await fetch(`http://127.0.0.1:8000/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!res.ok) {
        throw new Error('Erro ao atualizar técnico')
      }

      alert('Técnico atualizado com sucesso!')
      navigate('/admin-dashboard')
    } catch (error) {
      console.error('Erro ao atualizar técnico:', error)
      alert('Erro ao atualizar técnico')
    } finally {
      setLoading(false)
    }
  }

  const timeSlots = {
    manha: ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00'],
    tarde: ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    noite: ['19:00', '20:00', '21:00', '22:00', '23:00']
  }

  return (
    <div className="admin-technician-profile">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="brand-name">Chamados</span>
              <span className="brand-role">ADMIN</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className="nav-item"
            onClick={() => navigate('/admin-dashboard')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Chamados</span>
          </button>
          
          <button 
            className="nav-item active"
            onClick={() => navigate('/admin-dashboard?tab=tecnicos')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Técnicos</span>
          </button>
          
          <button 
            className="nav-item"
            onClick={() => navigate('/admin-dashboard?tab=clientes')}
          >
            <span className="nav-icon">💼</span>
            <span className="nav-text">Clientes</span>
          </button>
          
          <button 
            className="nav-item"
            onClick={() => navigate('/admin-dashboard?tab=servicos')}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">Serviços</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <span>UA</span>
            </div>
            <div className="user-info">
              <div className="user-name">Usuário Adm</div>
              <div className="user-email">user.adm@test.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="technician-profile-container">
          {/* Header */}
          <div className="profile-header">
            <button 
              className="back-btn"
              onClick={() => navigate('/admin-dashboard')}
            >
              ← Voltar
            </button>
            <h1 className="page-title">Perfil de técnico</h1>
            <div className="profile-actions">
              <button 
                className="cancel-btn"
                onClick={() => navigate('/admin-dashboard')}
              >
                Cancelar
              </button>
              <button 
                className="save-btn"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* Loading */}
          {technicianLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando perfil do técnico...</p>
            </div>
          ) : technician ? (
            <div className="profile-form-container">
              {/* Dados Pessoais */}
              <div className="profile-section personal-data">
                <h2>Dados pessoais</h2>
                <p className="section-subtitle">Defina as informações do perfil de técnico</p>
                
                <div className="form-group">
                  <label htmlFor="full_name">NOME</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-MAIL</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="exemplo@mail.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">SENHA</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Defina a senha de acesso"
                  />
                  <small className="form-hint">Mínimo de 6 dígitos</small>
                </div>
              </div>

              {/* Horários de Atendimento */}
              <div className="profile-section service-hours">
                <h2>Horários de atendimento</h2>
                <p className="section-subtitle">Selecione os horários de disponibilidade do técnico para atendimento</p>
                
                <div className="time-slots">
                  <div className="time-group">
                    <h3>MANHÃ</h3>
                    <div className="time-buttons">
                      {timeSlots.manha.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          className={`time-btn ${formData.availability.includes(timeSlot) ? 'selected' : ''}`}
                          onClick={() => handleTimeSlotToggle(timeSlot)}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="time-group">
                    <h3>TARDE</h3>
                    <div className="time-buttons">
                      {timeSlots.tarde.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          className={`time-btn ${formData.availability.includes(timeSlot) ? 'selected' : ''}`}
                          onClick={() => handleTimeSlotToggle(timeSlot)}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="time-group">
                    <h3>NOITE</h3>
                    <div className="time-buttons">
                      {timeSlots.noite.map((timeSlot) => (
                        <button
                          key={timeSlot}
                          type="button"
                          className={`time-btn ${formData.availability.includes(timeSlot) ? 'selected' : ''}`}
                          onClick={() => handleTimeSlotToggle(timeSlot)}
                        >
                          {timeSlot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="error-state">
              <p>Técnico não encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
