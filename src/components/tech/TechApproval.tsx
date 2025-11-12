import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { getPendingTechnicians, approveTechnician as approveTechnicianAPI, rejectTechnician as rejectTechnicianAPI } from '../../api/api'
import LoadingSpinner from '../LoadingSpinner'

interface PendingTech {
  id: number
  username: string
  email: string
  full_name: string
  employee_id: string
  department: string
  specialty: string[]
  phone: string
  emergency_contact?: string
  certifications?: string
  experience_years?: string
  availability: string
  notes?: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

function TechApproval() {
  const { token } = useAuth()
  const { showError: showErrorToast, showSuccess: showSuccessToast } = useToast()
  const [pendingTechs, setPendingTechs] = useState<PendingTech[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTech, setSelectedTech] = useState<PendingTech | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (token) {
      fetchPendingTechnicians()
    }
  }, [token])

  const fetchPendingTechnicians = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!token) {
        const errorMsg = 'Token não disponível. Faça login novamente.'
        showErrorToast(errorMsg)
        setError(errorMsg)
        setLoading(false)
        return
      }

      console.log('👥 Buscando técnicos pendentes de aprovação da API...')
      
      try {
        const response = await getPendingTechnicians(token)
        const data = response.data || []

        const pendingTechsData: PendingTech[] = data.map((tech: any) => ({
          id: tech.id,
          username: tech.username || '',
          email: tech.email || '',
          full_name: tech.full_name || tech.name || 'Técnico',
          employee_id: tech.employee_id || tech.employeeId || `TEC${tech.id}`,
          department: tech.department || 'TI',
          specialty: Array.isArray(tech.specialty) ? tech.specialty : (tech.specialty ? [tech.specialty] : []),
          phone: tech.phone || tech.phone_number || 'Não informado',
          emergency_contact: tech.emergency_contact || tech.emergencyContact,
          certifications: tech.certifications || tech.certification,
          experience_years: tech.experience_years?.toString() || tech.experienceYears?.toString() || '0',
          availability: tech.availability || 'full-time',
          notes: tech.notes || tech.observations,
          created_at: tech.created_at || tech.createdAt || new Date().toISOString(),
          status: (tech.is_approved === true ? 'approved' : tech.is_approved === false ? 'rejected' : 'pending') as PendingTech['status']
        }))

        setPendingTechs(pendingTechsData)
        console.log('✅ Técnicos pendentes carregados:', pendingTechsData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar técnicos pendentes:', error.response?.data || error.message)
        const errorMessage = handleApiError(error)
        showErrorToast(`Erro ao carregar técnicos: ${errorMessage}`)
        setError(errorMessage)
        setPendingTechs([])
      }
    } catch (error) {
      console.error('❌ Erro geral ao buscar técnicos pendentes:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(`Erro ao carregar técnicos: ${errorMessage}`)
      setError(errorMessage)
      setPendingTechs([])
    } finally {
      setLoading(false)
    }
  }

  const approveTechnician = async (techId: number) => {
    try {
      if (!token) {
        showErrorToast('Token não disponível. Faça login novamente.')
        return
      }

      if (!approvalReason.trim()) {
        showErrorToast('Por favor, informe o motivo da aprovação.')
        return
      }

      console.log('✅ Aprovando técnico', techId, 'Motivo:', approvalReason)

      try {
        await approveTechnicianAPI(token, techId, approvalReason)

        // Atualizar lista local
        const updatedTechs = pendingTechs.map(tech =>
          tech.id === techId ? { ...tech, status: 'approved' as const } : tech
        )
        setPendingTechs(updatedTechs)

        setApprovalReason('')
        setSelectedTech(null)
        showSuccessToast('Técnico aprovado com sucesso!')
        
        // Recarregar dados
        fetchPendingTechnicians()
      } catch (error: any) {
        console.error('❌ Erro ao aprovar técnico:', error.response?.data || error.message)
        const errorMessage = handleApiError(error)
        showErrorToast(`Erro ao aprovar técnico: ${errorMessage}`)
      }
    } catch (error) {
      console.error('❌ Erro ao aprovar técnico:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(`Erro ao aprovar técnico: ${errorMessage}`)
    }
  }

  const rejectTechnician = async (techId: number) => {
    try {
      if (!token) {
        showErrorToast('Token não disponível. Faça login novamente.')
        return
      }

      if (!rejectionReason.trim()) {
        showErrorToast('Por favor, informe o motivo da rejeição.')
        return
      }

      console.log('❌ Rejeitando técnico', techId, 'Motivo:', rejectionReason)

      try {
        await rejectTechnicianAPI(token, techId, rejectionReason)

        // Atualizar lista local
        const updatedTechs = pendingTechs.map(tech =>
          tech.id === techId ? { ...tech, status: 'rejected' as const } : tech
        )
        setPendingTechs(updatedTechs)

        setRejectionReason('')
        setSelectedTech(null)
        showSuccessToast('Técnico rejeitado com sucesso.')
        
        // Recarregar dados
        fetchPendingTechnicians()
      } catch (error: any) {
        console.error('❌ Erro ao rejeitar técnico:', error.response?.data || error.message)
        const errorMessage = handleApiError(error)
        showErrorToast(`Erro ao rejeitar técnico: ${errorMessage}`)
      }
    } catch (error) {
      console.error('❌ Erro ao rejeitar técnico:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(`Erro ao rejeitar técnico: ${errorMessage}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-badge pending'
      case 'approved': return 'status-badge resolved'
      case 'rejected': return 'status-badge closed'
      default: return 'status-badge pending'
    }
  }

  if (loading) {
    return <LoadingSpinner size="large" message="Carregando solicitações de técnicos..." fullScreen={false} />
  }

  return (
    <div className="tech-approval">
      <div className="section-header">
        <h2>👥 Aprovação de Técnicos</h2>
        <div className="section-actions">
          <button 
            className="action-btn primary" 
            onClick={fetchPendingTechnicians}
            disabled={loading}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #ef4444', 
          borderRadius: '6px',
          color: '#991b1b',
          marginBottom: '1rem'
        }}>
          ❌ {error}
          <button 
            onClick={fetchPendingTechnicians}
            style={{
              marginLeft: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      )}

      <div className="approval-stats">
        <div className="stat-card">
          <h3>Pendentes</h3>
          <div className="stat-value">{pendingTechs.filter(t => t.status === 'pending').length}</div>
        </div>
        <div className="stat-card">
          <h3>Aprovados</h3>
          <div className="stat-value">{pendingTechs.filter(t => t.status === 'approved').length}</div>
        </div>
        <div className="stat-card">
          <h3>Rejeitados</h3>
          <div className="stat-value">{pendingTechs.filter(t => t.status === 'rejected').length}</div>
        </div>
      </div>

      <div className="approval-layout">
        {/* Lista de técnicos */}
        <div className="tech-list">
          <h3>Solicitações Pendentes</h3>
          <div className="tech-grid">
            {pendingTechs.map((tech) => (
              <div 
                key={tech.id}
                className={`tech-card ${selectedTech?.id === tech.id ? 'selected' : ''}`}
                onClick={() => setSelectedTech(tech)}
              >
                <div className="tech-header">
                  <span className="tech-id">#{tech.employee_id}</span>
                  <span className={getStatusColor(tech.status)}>
                    {tech.status}
                  </span>
                </div>
                <h4>{tech.full_name}</h4>
                <div className="tech-details">
                  <p><strong>Usuário:</strong> {tech.username}</p>
                  <p><strong>Departamento:</strong> {tech.department}</p>
                  <p><strong>Especialidades:</strong> {tech.specialty.join(', ')}</p>
                  <p><strong>Experiência:</strong> {tech.experience_years} anos</p>
                  <p><strong>Solicitado em:</strong> {formatDate(tech.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes e ações */}
        {selectedTech && (
          <div className="tech-details-panel">
            <div className="details-header">
              <h3>{selectedTech.full_name}</h3>
              <span className={getStatusColor(selectedTech.status)}>
                {selectedTech.status}
              </span>
            </div>

            <div className="details-content">
              {/* Informações pessoais */}
              <div className="detail-section">
                <h4>👤 Informações Pessoais</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nome de Usuário:</label>
                    <span>{selectedTech.username}</span>
                  </div>
                  <div className="detail-item">
                    <label>E-mail:</label>
                    <span>{selectedTech.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Telefone:</label>
                    <span>{selectedTech.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contato Emergência:</label>
                    <span>{selectedTech.emergency_contact || 'Não informado'}</span>
                  </div>
                  <div className="detail-item">
                    <label>ID Funcionário:</label>
                    <span>{selectedTech.employee_id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Solicitado em:</label>
                    <span>{formatDate(selectedTech.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Informações profissionais */}
              <div className="detail-section">
                <h4>💼 Informações Profissionais</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Departamento:</label>
                    <span>{selectedTech.department}</span>
                  </div>
                  <div className="detail-item">
                    <label>Disponibilidade:</label>
                    <span>{selectedTech.availability}</span>
                  </div>
                  <div className="detail-item">
                    <label>Anos de Experiência:</label>
                    <span>{selectedTech.experience_years} anos</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Especialidades:</label>
                    <div className="specialties-list">
                      {selectedTech.specialty.map(spec => (
                        <span key={spec} className="specialty-badge">{spec}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificações */}
              {selectedTech.certifications && (
                <div className="detail-section">
                  <h4>🏆 Certificações</h4>
                  <div className="certifications-box">
                    {selectedTech.certifications}
                  </div>
                </div>
              )}

              {/* Observações */}
              {selectedTech.notes && (
                <div className="detail-section">
                  <h4>📝 Observações</h4>
                  <div className="notes-box">
                    {selectedTech.notes}
                  </div>
                </div>
              )}

              {/* Ações de aprovação */}
              {selectedTech.status === 'pending' && (
                <div className="detail-section">
                  <h4>✅ Ações de Aprovação</h4>
                  <div className="approval-actions">
                    <div className="form-group">
                      <label>Motivo da Aprovação:</label>
                      <textarea 
                        value={approvalReason}
                        onChange={(e) => setApprovalReason(e.target.value)}
                        placeholder="Justifique a aprovação deste técnico..."
                        className="form-textarea"
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label>Motivo da Rejeição:</label>
                      <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Justifique a rejeição desta solicitação..."
                        className="form-textarea"
                        rows={3}
                      />
                    </div>
                    <div className="form-actions">
                      <button 
                        className="action-btn success"
                        onClick={() => approveTechnician(selectedTech.id)}
                        disabled={!approvalReason.trim()}
                      >
                        ✅ Aprovar
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => rejectTechnician(selectedTech.id)}
                        disabled={!rejectionReason.trim()}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TechApproval
