import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApprovalTickets, approveTicketRequest, rejectTicketRequest, reassignTicket as reassignTicketAPI, getTecnicosTodos } from '../../api/api'

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
  const { token } = useAuth()
  const [approvalTickets, setApprovalTickets] = useState<ApprovalTicket[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'pending_reassignment' | 'approved'>('all')
  const [selectedTicket, setSelectedTicket] = useState<ApprovalTicket | null>(null)
  const [approvalReason, setApprovalReason] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [newTechnician, setNewTechnician] = useState('')

  useEffect(() => {
    if (token) {
    fetchApprovalData()
      fetchTechnicians()
    }
  }, [token])

  const fetchApprovalData = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        console.error('❌ Token não disponível')
        return
      }

      console.log('✅ Buscando tickets de aprovação da API...')
      
      try {
        const response = await getApprovalTickets(token)
        const data = response.data || []

        const approvalTicketsData: ApprovalTicket[] = data.map((item: any) => ({
          id: item.id || item.ticket_id,
          title: item.title || item.ticket?.title || 'Sem título',
          description: item.description || item.ticket?.description || '',
          priority: item.priority || item.ticket?.priority || 'medium',
          category: item.category || item.ticket?.problem_type || item.ticket?.category || 'Outros',
          user_name: item.user_name || item.ticket?.user?.full_name || item.user?.full_name || 'Usuário',
          current_technician: item.current_technician || item.ticket?.assigned_technician?.full_name || 'Não atribuído',
          requested_technician: item.requested_technician || item.new_technician?.full_name,
          reason: item.reason || item.request_reason || '',
          status: (item.status || 'pending_approval') as ApprovalTicket['status'],
          created_at: item.created_at || item.ticket?.created_at || new Date().toISOString(),
          requested_at: item.requested_at || item.created_at || new Date().toISOString(),
          estimated_cost: item.estimated_cost || item.cost,
          requires_approval: item.requires_approval !== false,
          approval_reason: item.approval_reason
        }))

        setApprovalTickets(approvalTicketsData)
        console.log('✅ Tickets de aprovação carregados:', approvalTicketsData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar tickets de aprovação:', error.response?.data || error.message)
        setApprovalTickets([])
      }
    } catch (error) {
      console.error('❌ Erro geral ao buscar dados de aprovação:', error)
      setApprovalTickets([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      if (!token) return

      console.log('👥 Buscando técnicos para reatribuição...')
      
      try {
        // Buscar técnicos usando endpoint com autenticação
        const response = await fetch('http://127.0.0.1:8000/tech/todos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Erro ao buscar técnicos')
        }
        
        const data = await response.json()

        const techniciansData: Technician[] = data
          .filter((tech: any) => tech.is_active && tech.is_approved)
          .map((tech: any) => ({
            id: tech.id,
            name: tech.full_name || tech.name,
            specialty: tech.specialty || [],
            current_load: tech.current_load || tech.active_tickets_count || 0,
            status: tech.status || 'available',
            rating: tech.rating || 4.5
          }))

        setTechnicians(techniciansData)
        console.log('✅ Técnicos carregados:', techniciansData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar técnicos:', error.response?.data || error.message)
        setTechnicians([])
      }
    } catch (error) {
      console.error('❌ Erro geral ao buscar técnicos:', error)
      setTechnicians([])
    }
  }

  const filteredTickets = approvalTickets.filter(ticket => {
    if (filter === 'all') return true
    return ticket.status === filter
  })

  const approveTicket = async (ticketId: number, approved: boolean) => {
    try {
      if (!token) {
        alert('Token não disponível')
        return
      }

      const reason = approved ? approvalReason : rejectionReason
      if (!reason.trim()) {
        alert('Por favor, informe o motivo da decisão')
        return
      }

      console.log(`${approved ? 'Aprovando' : 'Rejeitando'} ticket ${ticketId}:`, reason)

      try {
        if (approved) {
          await approveTicketRequest(token, ticketId, reason)
        } else {
          await rejectTicketRequest(token, ticketId, reason)
        }

        // Atualizar lista local
      const updatedTickets = approvalTickets.map(ticket =>
        ticket.id === ticketId
            ? { ...ticket, status: (approved ? 'approved' : 'rejected') as ApprovalTicket['status'], approval_reason: reason }
          : ticket
      )
      setApprovalTickets(updatedTickets)

      setApprovalReason('')
      setRejectionReason('')
      setSelectedTicket(null)
        alert(`✅ Ticket ${approved ? 'aprovado' : 'rejeitado'} com sucesso!`)
        
        // Recarregar dados
        fetchApprovalData()
      } catch (error: any) {
        console.error(`❌ Erro ao ${approved ? 'aprovar' : 'rejeitar'} ticket:`, error.response?.data || error.message)
        alert(`Erro ao ${approved ? 'aprovar' : 'rejeitar'} ticket: ${error.response?.data?.detail || error.message}`)
      }
    } catch (error) {
      console.error('❌ Erro ao processar aprovação:', error)
      alert('Erro ao processar aprovação')
    }
  }

  const reassignTicket = async (ticketId: number) => {
    try {
      if (!token) {
        alert('Token não disponível')
        return
      }

      if (!newTechnician) {
        alert('Por favor, selecione um técnico')
        return
      }

      // Encontrar o ID do técnico selecionado
      const selectedTech = technicians.find(tech => tech.name === newTechnician)
      if (!selectedTech) {
        alert('Técnico não encontrado')
        return
      }

      console.log('🔄 Reatribuindo ticket', ticketId, 'para técnico', selectedTech.id)

      try {
        await reassignTicketAPI(token, ticketId, selectedTech.id, 'Reatribuição solicitada')

        // Atualizar lista local
      const updatedTickets = approvalTickets.map(ticket =>
        ticket.id === ticketId
            ? { ...ticket, status: 'approved' as ApprovalTicket['status'], current_technician: newTechnician }
          : ticket
      )
      setApprovalTickets(updatedTickets)

      setNewTechnician('')
      setSelectedTicket(null)
        alert('✅ Ticket reatribuído com sucesso!')
        
        // Recarregar dados
        fetchApprovalData()
      } catch (error: any) {
        console.error('❌ Erro ao reatribuir ticket:', error.response?.data || error.message)
        alert(`Erro ao reatribuir ticket: ${error.response?.data?.detail || error.message}`)
      }
    } catch (error) {
      console.error('❌ Erro ao reatribuir ticket:', error)
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
