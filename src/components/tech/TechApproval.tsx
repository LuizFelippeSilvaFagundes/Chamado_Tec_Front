import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

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
  const [pendingTechs, setPendingTechs] = useState<PendingTech[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTech, setSelectedTech] = useState<PendingTech | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchPendingTechnicians()
  }, [])

  const fetchPendingTechnicians = async () => {
    try {
      setLoading(true)
      // Simulação de dados - substituir pela chamada real da API
      const mockTechs: PendingTech[] = [
        {
          id: 1,
          username: 'joao.tecnico',
          email: 'joao.tecnico@empresa.com',
          full_name: 'João Silva Santos',
          employee_id: 'EMP001',
          department: 'TI - Suporte',
          specialty: ['Hardware', 'Software', 'Rede'],
          phone: '(11) 99999-1111',
          emergency_contact: '(11) 88888-1111',
          certifications: 'CCNA, ITIL Foundation, AWS Cloud Practitioner',
          experience_years: '5',
          availability: 'full-time',
          notes: 'Experiência em suporte técnico e infraestrutura de rede',
          created_at: '2024-01-15T10:30:00Z',
          status: 'pending'
        },
        {
          id: 2,
          username: 'maria.suporte',
          email: 'maria.suporte@empresa.com',
          full_name: 'Maria Oliveira Costa',
          employee_id: 'EMP002',
          department: 'TI - Infraestrutura',
          specialty: ['Servidores', 'Backup', 'Virtualização'],
          phone: '(11) 99999-2222',
          emergency_contact: '(11) 88888-2222',
          certifications: 'MCSA, VCP, CompTIA Server+',
          experience_years: '8',
          availability: 'full-time',
          notes: 'Especialista em servidores Windows e VMware',
          created_at: '2024-01-14T14:20:00Z',
          status: 'pending'
        },
        {
          id: 3,
          username: 'pedro.rede',
          email: 'pedro.rede@empresa.com',
          full_name: 'Pedro Mendes Alves',
          employee_id: 'EMP003',
          department: 'TI - Redes',
          specialty: ['Rede', 'Telefonia', 'Segurança'],
          phone: '(11) 99999-3333',
          emergency_contact: '(11) 88888-3333',
          certifications: 'CCNP, CISM, CEH',
          experience_years: '6',
          availability: 'on-call',
          notes: 'Especialista em redes e segurança',
          created_at: '2024-01-13T09:15:00Z',
          status: 'pending'
        }
      ]
      setPendingTechs(mockTechs)
    } catch (error) {
      console.error('Erro ao buscar técnicos pendentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveTechnician = async (techId: number) => {
    try {
      if (!approvalReason.trim()) {
        alert('Por favor, informe o motivo da aprovação')
        return
      }

      // Simulação de aprovação - substituir pela chamada real da API
      console.log('Aprovando técnico', techId, 'Motivo:', approvalReason)

      const updatedTechs = pendingTechs.map(tech =>
        tech.id === techId ? { ...tech, status: 'approved' as const } : tech
      )
      setPendingTechs(updatedTechs)

      setApprovalReason('')
      setSelectedTech(null)
      alert('Técnico aprovado com sucesso!')
    } catch (error) {
      console.error('Erro ao aprovar técnico:', error)
      alert('Erro ao aprovar técnico')
    }
  }

  const rejectTechnician = async (techId: number) => {
    try {
      if (!rejectionReason.trim()) {
        alert('Por favor, informe o motivo da rejeição')
        return
      }

      // Simulação de rejeição - substituir pela chamada real da API
      console.log('Rejeitando técnico', techId, 'Motivo:', rejectionReason)

      const updatedTechs = pendingTechs.map(tech =>
        tech.id === techId ? { ...tech, status: 'rejected' as const } : tech
      )
      setPendingTechs(updatedTechs)

      setRejectionReason('')
      setSelectedTech(null)
      alert('Técnico rejeitado.')
    } catch (error) {
      console.error('Erro ao rejeitar técnico:', error)
      alert('Erro ao rejeitar técnico')
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
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando solicitações de técnicos...</p>
      </div>
    )
  }

  return (
    <div className="tech-approval">
      <div className="section-header">
        <h2>👥 Aprovação de Técnicos</h2>
        <div className="section-actions">
          <button className="action-btn primary" onClick={fetchPendingTechnicians}>
            🔄 Atualizar
          </button>
        </div>
      </div>

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
