import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface ApprovalTicket {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  user_name: string
  current_technician: string
  requested_technician?: string
  reason: string
  status: 'pending_approval' | 'pending_reassignment' | 'approved' | 'rejected'
  created_at: string
  requested_at: string
  estimated_cost?: number
  requires_approval: boolean
  approval_reason?: string
}

interface Technician {
  id: number
  name: string
  specialty: string[]
  current_load: number
  status: 'available' | 'busy' | 'away'
  rating: number
}

function ApprovalSystem() {
  const { token, user } = useAuth()
  const [approvalTickets, setApprovalTickets] = useState<ApprovalTicket[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'pending_reassignment' | 'approved'>('all')
  const [selectedTicket, setSelectedTicket] = useState<ApprovalTicket | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [newTechnician, setNewTechnician] = useState('')

  useEffect(() => {
    fetchApprovalData()
  }, [])

  const fetchApprovalData = async () => {
    try {
      setLoading(true)
      // Simulação de dados - substituir pela chamada real da API
      const mockApprovalTickets: ApprovalTicket[] = [
        {
          id: 201,
          title: 'Substituição de servidor crítico',
          description: 'Servidor principal apresentou falha e precisa ser substituído imediatamente',
          priority: 'critical',
          category: 'Hardware',
          user_name: 'João Silva',
          current_technician: 'Maria Santos',
          reason: 'Necessário técnico especializado em servidores',
          status: 'pending_reassignment',
          created_at: '2024-01-15T10:00:00Z',
          requested_at: '2024-01-15T10:30:00Z',
          estimated_cost: 15000,
          requires_approval: true
        },
        {
          id: 202,
          title: 'Atualização de software licenciado',
          description: 'Solicitação de atualização do sistema operacional em 50 computadores',
          priority: 'high',
          category: 'Software',
          user_name: 'Pedro Costa',
          current_technician: 'João Silva',
          reason: 'Custo elevado requer aprovação gerencial',
          status: 'pending_approval',
          created_at: '2024-01-15T09:00:00Z',
          requested_at: '2024-01-15T09:15:00Z',
          estimated_cost: 5000,
          requires_approval: true
        },
        {
          id: 203,
          title: 'Manutenção preventiva - rede',
          description: 'Manutenção programada da infraestrutura de rede',
          priority: 'medium',
          category: 'Rede',
          user_name: 'Ana Oliveira',
          current_technician: 'Pedro Costa',
          requested_technician: 'Carlos Mendes',
          reason: 'Técnico atual sobrecarregado',
          status: 'pending_reassignment',
          created_at: '2024-01-15T08:00:00Z',
          requested_at: '2024-01-15T08:30:00Z',
          requires_approval: false
        },
        {
          id: 204,
          title: 'Instalação de nova impressora',
          description: 'Solicitação de instalação de impressora multifuncional',
          priority: 'low',
          category: 'Periféricos',
          user_name: 'Maria Santos',
          current_technician: 'Ana Oliveira',
          reason: 'Aprovação de compra necessária',
          status: 'pending_approval',
          created_at: '2024-01-15T07:00:00Z',
          requested_at: '2024-01-15T07:20:00Z',
          estimated_cost: 2500,
          requires_approval: true
        }
      ]

      const mockTechnicians: Technician[] = [
        {
          id: 1,
          name: 'Carlos Mendes',
          specialty: ['Rede', 'Servidores'],
          current_load: 3,
          status: 'available',
          rating: 4.8
        },
        {
          id: 2,
          name: 'Fernanda Lima',
          specialty: ['Hardware', 'Software'],
          current_load: 7,
          status: 'busy',
          rating: 4.6
        },
        {
          id: 3,
          name: 'Roberto Alves',
          specialty: ['Periféricos', 'Hardware'],
          current_load: 2,
          status: 'available',
          rating: 4.9
        },
        {
          id: 4,
          name: 'Lucia Ferreira',
          specialty: ['Software', 'Rede'],
          current_load: 5,
          status: 'available',
          rating: 4.7
        }
      ]

      setApprovalTickets(mockApprovalTickets)
      setTechnicians(mockTechnicians)
    } catch (error) {
      console.error('Erro ao buscar dados de aprovação:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = approvalTickets.filter(ticket => {
    if (filter === 'all') return true
    return ticket.status === filter
  })

  const approveTicket = async (ticketId: number, approved: boolean) => {
    try {
      const reason = approved ? approvalReason : rejectionReason
      if (!reason.trim()) {
        alert('Por favor, informe o motivo da decisão')
        return
      }

      // Simulação de aprovação - substituir pela chamada real da API
      console.log(`${approved ? 'Aprovando' : 'Rejeitando'} ticket ${ticketId}:`, reason)

      const updatedTickets = approvalTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: approved ? 'approved' : 'rejected', approval_reason: reason }
          : ticket
      )
      setApprovalTickets(updatedTickets)

      setApprovalReason('')
      setRejectionReason('')
      setSelectedTicket(null)
      alert(`Ticket ${approved ? 'aprovado' : 'rejeitado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao processar aprovação:', error)
      alert('Erro ao processar aprovação')
    }
  }

  const reassignTicket = async (ticketId: number) => {
    try {
      if (!newTechnician) {
        alert('Por favor, selecione um técnico')
        return
      }

      // Simulação de reatribuição - substituir pela chamada real da API
      console.log('Reatribuindo ticket', ticketId, 'para técnico', newTechnician)

      const updatedTickets = approvalTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status: 'approved', current_technician: newTechnician }
          : ticket
      )
      setApprovalTickets(updatedTickets)

      setNewTechnician('')
      setSelectedTicket(null)
      alert('Ticket reatribuído com sucesso!')
    } catch (error) {
      console.error('Erro ao reatribuir ticket:', error)
      alert('Erro ao reatribuir ticket')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'priority-badge low'
      case 'medium': return 'priority-badge medium'
      case 'high': return 'priority-badge high'
      case 'critical': return 'priority-badge critical'
      default: return 'priority-badge low'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'status-badge pending'
      case 'pending_reassignment': return 'status-badge in-progress'
      case 'approved': return 'status-badge resolved'
      case 'rejected': return 'status-badge closed'
      default: return 'status-badge pending'
    }
  }

  const getTechnicianStatus = (status: string) => {
    switch (status) {
      case 'available': return 'technician-available'
      case 'busy': return 'technician-busy'
      case 'away': return 'technician-away'
      default: return 'technician-away'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando sistema de aprovação...</p>
      </div>
    )
  }

  return (
    <div className="approval-system">
      <div className="section-header">
        <h2>✅ Sistema de Aprovação</h2>
        <div className="section-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="pending_approval">Aguardando Aprovação</option>
            <option value="pending_reassignment">Aguardando Reatribuição</option>
            <option value="approved">Aprovados</option>
          </select>
          <button className="action-btn primary" onClick={fetchApprovalData}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="approval-layout">
        {/* Lista de tickets */}
        <div className="approval-list">
          <h3>Solicitações Pendentes</h3>
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id}
                className={`approval-card ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="approval-header">
                  <span className="ticket-id">#{ticket.id}</span>
                  <span className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </span>
                </div>
                <h4>{ticket.title}</h4>
                <div className="approval-details">
                  <p><strong>Solicitante:</strong> {ticket.user_name}</p>
                  <p><strong>Técnico Atual:</strong> {ticket.current_technician}</p>
                  {ticket.estimated_cost && (
                    <p><strong>Custo Estimado:</strong> {formatCurrency(ticket.estimated_cost)}</p>
                  )}
                </div>
                <div className="approval-status">
                  <span className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes e ações */}
        {selectedTicket && (
          <div className="approval-details">
            <div className="details-header">
              <h3>Solicitação #{selectedTicket.id}</h3>
              <span className={getStatusColor(selectedTicket.status)}>
                {selectedTicket.status.replace('_', ' ')}
              </span>
            </div>

            <div className="details-content">
              {/* Informações básicas */}
              <div className="detail-section">
                <h4>📋 Informações da Solicitação</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Título:</label>
                    <span>{selectedTicket.title}</span>
                  </div>
                  <div className="detail-item">
                    <label>Categoria:</label>
                    <span>{selectedTicket.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Prioridade:</label>
                    <span className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Solicitante:</label>
                    <span>{selectedTicket.user_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Técnico Atual:</label>
                    <span>{selectedTicket.current_technician}</span>
                  </div>
                  <div className="detail-item">
                    <label>Solicitado em:</label>
                    <span>{formatDate(selectedTicket.requested_at)}</span>
                  </div>
                  {selectedTicket.estimated_cost && (
                    <div className="detail-item">
                      <label>Custo Estimado:</label>
                      <span className="cost-highlight">{formatCurrency(selectedTicket.estimated_cost)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>📝 Descrição</h4>
                <div className="description-box">
                  {selectedTicket.description}
                </div>
              </div>

              <div className="detail-section">
                <h4>💭 Motivo da Solicitação</h4>
                <div className="reason-box">
                  {selectedTicket.reason}
                </div>
              </div>

              {/* Ações baseadas no status */}
              {selectedTicket.status === 'pending_approval' && (
                <div className="detail-section">
                  <h4>🔧 Ações de Aprovação</h4>
                  <div className="approval-actions">
                    <div className="form-group">
                      <label>Motivo da Aprovação:</label>
                      <textarea 
                        value={approvalReason}
                        onChange={(e) => setApprovalReason(e.target.value)}
                        placeholder="Justifique a aprovação desta solicitação..."
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
                        onClick={() => approveTicket(selectedTicket.id, true)}
                        disabled={!approvalReason.trim()}
                      >
                        ✅ Aprovar
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => approveTicket(selectedTicket.id, false)}
                        disabled={!rejectionReason.trim()}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket.status === 'pending_reassignment' && (
                <div className="detail-section">
                  <h4>👥 Reatribuição de Técnico</h4>
                  <div className="reassignment-actions">
                    <div className="form-group">
                      <label>Selecionar Novo Técnico:</label>
                      <select 
                        value={newTechnician}
                        onChange={(e) => setNewTechnician(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Escolha um técnico</option>
                        {technicians
                          .filter(tech => tech.status === 'available')
                          .map(tech => (
                            <option key={tech.id} value={tech.name}>
                              {tech.name} - {tech.specialty.join(', ')} (Carga: {tech.current_load})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    
                    <div className="technicians-list">
                      <h5>Técnicos Disponíveis:</h5>
                      {technicians
                        .filter(tech => tech.status === 'available')
                        .map(tech => (
                          <div 
                            key={tech.id} 
                            className={`technician-item ${getTechnicianStatus(tech.status)}`}
                            onClick={() => setNewTechnician(tech.name)}
                          >
                            <div className="technician-info">
                              <h6>{tech.name}</h6>
                              <span className="specialty">{tech.specialty.join(', ')}</span>
                              <span className="rating">⭐ {tech.rating}</span>
                            </div>
                            <div className="technician-load">
                              Carga atual: {tech.current_load}
                            </div>
                          </div>
                        ))
                      }
                    </div>

                    <div className="form-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => reassignTicket(selectedTicket.id)}
                        disabled={!newTechnician}
                      >
                        🔄 Reatribuir
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedTicket.approval_reason && (
                <div className="detail-section">
                  <h4>📋 Decisão Tomada</h4>
                  <div className="decision-box">
                    {selectedTicket.approval_reason}
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

export default ApprovalSystem
