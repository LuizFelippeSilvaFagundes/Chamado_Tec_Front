import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime, formatDateOnly, isDateOverdue } from '../../utils/dateUtils'
import { getAdminAssignedTickets, updateTicketStatus } from '../../api/api'
import AttachmentViewer from '../AttachmentViewer'
import './AssignedTickets.css'

interface Ticket {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed'
  category: string
  created_at: string
  updated_at?: string
  user_name: string
  equipment_id?: string
  sla_deadline: string
  estimated_time?: number
  assigned_technician_id?: number | null
  user_id: number
  assigned_by_admin?: boolean
  attachments?: any[]
  comments?: any[]
}

const statusConfig = {
  open: { label: 'Aberto', color: '#EF4444', icon: '❓' },
  pending: { label: 'Pendente', color: '#F59E0B', icon: '⏳' },
  'in-progress': { label: 'Em Atendimento', color: '#3B82F6', icon: '🕒' },
  resolved: { label: 'Resolvido', color: '#10B981', icon: '✅' },
  closed: { label: 'Fechado', color: '#6B7280', icon: '🔒' }
}

const priorityConfig = {
  low: { label: 'Baixa', color: '#10B981' },
  medium: { label: 'Média', color: '#F59E0B' },
  high: { label: 'Alta', color: '#EF4444' },
  critical: { label: 'Crítica', color: '#DC2626' }
}


function AssignedTickets() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  })

  useEffect(() => {
    if (token) {
    fetchAssignedTickets()
    }
  }, [token])

  useEffect(() => {
    filterTickets()
  }, [filters, tickets])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({type, message})
    setTimeout(() => setNotification(null), 3000)
  }

  const filterTickets = () => {
    let filtered = [...tickets]

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status)
    }

    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.user_name.toLowerCase().includes(searchLower)
      )
    }

    setFilteredTickets(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Buscar tickets atribuídos pelo admin ao técnico atual
      const response = await getAdminAssignedTickets(token)
      const data = response.data || []
      console.log('🎫 Tickets atribuídos pelo admin:', data)
      
      // Converter os dados da API para o formato esperado pelo componente
      const formattedTickets: Ticket[] = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.problem_type,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at || ticket.created_at,
        user_name: ticket.user?.full_name || ticket.user?.username || 'Usuário',
        equipment_id: ticket.equipment_id || 'N/A',
        sla_deadline: ticket.sla_deadline || ticket.created_at,
        estimated_time: ticket.estimated_time || 30,
        assigned_technician_id: ticket.assigned_technician_id,
        user_id: ticket.user_id,
        assigned_by_admin: ticket.assigned_by_admin,
        attachments: ticket.attachments || [],
        comments: ticket.comments || []
      }))
      
      setTickets(formattedTickets)
      setFilteredTickets(formattedTickets)
    } catch (error: any) {
      console.error('❌ Erro ao buscar tickets atribuídos pelo admin:', error.response?.data || error.message)
      setError('Erro ao carregar chamados atribuídos pelo admin')
      showNotification('error', 'Erro ao carregar chamados atribuídos pelo admin')
      setTickets([])
      setFilteredTickets([])
    } finally {
      setLoading(false)
    }
  }

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTicket(null)
  }

  // Função para atualizar status
  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      if (!token) {
        throw new Error('Token não encontrado')
      }

      await updateTicketStatus(token, ticketId, newStatus)
      
      // Recarregar tickets
      await fetchAssignedTickets()
      
      showNotification('success', `✅ Status atualizado para: ${newStatus}`)
      closeModal()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showNotification('error', '❌ Erro ao atualizar status.')
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando chamados atribuídos...</p>
      </div>
    )
  }

  return (
    <div className="assigned-tickets">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="section-header">
        <h1>🎫 Meus Chamados</h1>
        <p className="section-subtitle">Chamados atribuídos pelo administrador</p>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Nenhum chamado atribuído</h3>
          <p>Você ainda não tem chamados atribuídos para gerenciar.</p>
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <>
          {/* Filtros */}
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Buscar por título, descrição ou usuário..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="open">Aberto</option>
                <option value="pending">Pendente</option>
                <option value="in-progress">Em Andamento</option>
                <option value="resolved">Resolvido</option>
                <option value="closed">Fechado</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">Todas as prioridades</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>

              <button className="action-btn primary" onClick={fetchAssignedTickets}>
                🔄 Atualizar
              </button>
            </div>
          </div>

          {/* Cards de Chamados */}
          <div className="tickets-grid">
            {filteredTickets.length === 0 ? (
              <div className="no-tickets">
                <p>Nenhum chamado encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className="ticket-card"
                  onClick={() => openTicketDetails(ticket)}
                >
                  <div className="ticket-header">
                    <div className="ticket-title-section">
                      <h3>{ticket.title}</h3>
                      <div className="ticket-meta">
                        <span className="ticket-id">#{String(ticket.id).padStart(5, '0')}</span>
                        <span className="ticket-category">{ticket.category}</span>
                        <span className="ticket-user">👤 {ticket.user_name}</span>
                      </div>
                    </div>
                    <div className="ticket-status-section">
                      <div className="status-badge" style={{ backgroundColor: statusConfig[ticket.status]?.color || '#6B7280' }}>
                        {statusConfig[ticket.status]?.icon} {statusConfig[ticket.status]?.label}
                      </div>
                      <div className="priority-badge" style={{ backgroundColor: priorityConfig[ticket.priority]?.color || '#10B981' }}>
                        {priorityConfig[ticket.priority]?.label}
                      </div>
                      {ticket.assigned_by_admin && <span className="admin-badge">👑 Admin</span>}
                    </div>
                  </div>

                  <div className="ticket-body">
                    <div className="ticket-description">
                      {ticket.description.length > 150 
                        ? `${ticket.description.substring(0, 150)}...` 
                        : ticket.description
                      }
                    </div>

                    <div className="ticket-details">
                      <div className="detail-item">
                        <strong>📅 Criado:</strong> {formatDateOnly(ticket.created_at)}
                      </div>
                      <div className="detail-item">
                        <strong>🕒 SLA:</strong> 
                        <span className={isDateOverdue(ticket.sla_deadline) ? 'sla-overdue' : 'sla-normal'}>
                          {formatDateOnly(ticket.sla_deadline)}
                        </span>
                      </div>
                    </div>

                    {ticket.comments && ticket.comments.length > 0 && (
                      <div className="comments-preview">
                        <span className="comments-count">
                          💬 {ticket.comments.length} comentário(s)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ticket-actions">
                    <button 
                      className="view-details-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        openTicketDetails(ticket)
                      }}
                    >
                      👁️ Ver Detalhes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal de Detalhes */}
      {showModal && selectedTicket && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedTicket.title}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="ticket-info">
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">
                    <div className="status-badge" style={{ backgroundColor: statusConfig[selectedTicket.status]?.color || '#6B7280' }}>
                      {statusConfig[selectedTicket.status]?.icon} {statusConfig[selectedTicket.status]?.label}
                    </div>
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Prioridade:</span>
                  <span className="info-value">
                    <div className="priority-badge" style={{ backgroundColor: priorityConfig[selectedTicket.priority]?.color || '#10B981' }}>
                      {priorityConfig[selectedTicket.priority]?.label}
                    </div>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Tipo:</span>
                  <span className="info-value">{selectedTicket.category}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Usuário:</span>
                  <span className="info-value">{selectedTicket.user_name}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Aberto em:</span>
                  <span className="info-value">{formatDateTime(selectedTicket.created_at)}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Última atualização:</span>
                  <span className="info-value">{formatDateTime(selectedTicket.updated_at || selectedTicket.created_at)}</span>
                </div>

                {selectedTicket.assigned_by_admin && (
                  <div className="info-row">
                    <span className="info-label">Atribuído por:</span>
                    <span className="info-value">👑 Administrador</span>
                  </div>
                )}
              </div>

              <div className="ticket-description-full">
                <h4>Descrição</h4>
                <p>{selectedTicket.description}</p>
              </div>

              {/* Seção de Progresso/Histórico */}
              <div className="ticket-progress-section">
                <h4>📊 Histórico do Chamado</h4>
                <div className="progress-timeline">
                  <div className="progress-item completed">
                    <div className="progress-icon">✅</div>
                    <div className="progress-content">
                      <div className="progress-title">Chamado Aberto</div>
                      <div className="progress-date">{formatDateTime(selectedTicket.created_at)}</div>
                      <div className="progress-description">Chamado criado por {selectedTicket.user_name}.</div>
                    </div>
                  </div>

                  {selectedTicket.assigned_technician_id && (
                    <div className="progress-item completed">
                      <div className="progress-icon">👨‍🔧</div>
                      <div className="progress-content">
                        <div className="progress-title">
                          {selectedTicket.assigned_by_admin ? 'Atribuído pelo Admin' : 'Auto-Atribuído'}
                        </div>
                        <div className="progress-description">
                          {selectedTicket.assigned_by_admin 
                            ? 'O administrador atribuiu este chamado a você.' 
                            : 'Você pegou este chamado da fila.'}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'in-progress' && (
                    <div className="progress-item current">
                      <div className="progress-icon">🔧</div>
                      <div className="progress-content">
                        <div className="progress-title">Em Atendimento</div>
                        <div className="progress-date">{selectedTicket.updated_at ? formatDateTime(selectedTicket.updated_at) : formatDateTime(selectedTicket.created_at)}</div>
                        <div className="progress-description">Você está trabalhando na resolução deste chamado.</div>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'resolved' && (
                    <div className="progress-item completed">
                      <div className="progress-icon">✅</div>
                      <div className="progress-content">
                        <div className="progress-title">Chamado Resolvido</div>
                        <div className="progress-date">{selectedTicket.updated_at ? formatDateTime(selectedTicket.updated_at) : formatDateTime(selectedTicket.created_at)}</div>
                        <div className="progress-description">Chamado concluído com sucesso!</div>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'closed' && (
                    <div className="progress-item completed">
                      <div className="progress-icon">🔒</div>
                      <div className="progress-content">
                        <div className="progress-title">Chamado Fechado</div>
                        <div className="progress-date">{selectedTicket.updated_at ? formatDateTime(selectedTicket.updated_at) : formatDateTime(selectedTicket.created_at)}</div>
                        <div className="progress-description">Chamado finalizado e arquivado.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações do Técnico */}
              <div className="ticket-actions-modal">
                {selectedTicket.status === 'open' && (
                  <button 
                    className="action-btn primary"
                    onClick={() => handleStatusChange(selectedTicket.id, 'in-progress')}
                  >
                    ▶️ Iniciar Atendimento
                  </button>
                )}
                {selectedTicket.status === 'in-progress' && (
                  <button 
                    className="action-btn success"
                    onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                  >
                    ✅ Marcar como Resolvido
                  </button>
                )}
                {selectedTicket.status === 'resolved' && (
                  <button 
                    className="action-btn info"
                    onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                  >
                    🔒 Fechar Chamado
                  </button>
                )}
              </div>

              {/* Anexos */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <AttachmentViewer
                  attachments={selectedTicket.attachments.map((att: any) => ({
                    id: att.id,
                    filename: att.filename || att.name || 'Arquivo',
                    url: att.url || att.path,
                    size: att.size,
                    type: att.type || att.mime_type,
                    created_at: att.created_at
                  }))}
                  ticketId={selectedTicket.id}
                  canDelete={false}
                />
              )}

              {/* Comentários */}
              {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                <div className="comments-section">
                  <h4>Comentários e Atualizações</h4>
                  <div className="comments-list">
                    {selectedTicket.comments.map(comment => (
                      <div key={comment.id} className={`comment ${comment.is_technical ? 'technical' : ''}`}>
                        <div className="comment-header">
                          <span className="comment-author">{comment.author}</span>
                          <span className="comment-date">{formatDateTime(comment.created_at)}</span>
                          {comment.is_technical && <span className="technical-badge">Técnico</span>}
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignedTickets