import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { formatDateTime } from '../../utils/dateUtils'
import { getResolvedTickets } from '../../api/api'
import AttachmentViewer from '../AttachmentViewer'
import LoadingSpinner from '../LoadingSpinner'
import './AssignedTickets.css'

interface TicketDetail {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed'
  category: string
  created_at: string
  user_name: string
  user_email: string
  equipment_id?: string
  sla_deadline: string
  estimated_time?: number
  history: TicketHistory[]
  attachments: string[]
  assigned_technician_id?: number | null
  user_id: number
}

interface TicketHistory {
  id: number
  action: string
  description: string
  timestamp: string
  technician_name: string
}

function TicketManagement() {
  const { token } = useAuth()
  const { showError: showErrorToast } = useToast()
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const [tickets, setTickets] = useState<TicketDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'resolved' | 'closed'>('all')

  useEffect(() => {
    if (token) {
      fetchTickets()
    }
  }, [token])
  
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

  const openTicketDetails = (ticket: TicketDetail) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTicket(null)
  }

  const fetchTickets = async () => {
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

      console.log('📋 Buscando chamados resolvidos pelo técnico...')
      
      // Buscar tickets resolvidos pelo técnico logado
      const response = await getResolvedTickets(token)
      const data = response.data || []
      console.log('✅ Tickets resolvidos carregados:', data)
      
      // Converter os dados da API para o formato esperado pelo componente
      const formattedTickets: TicketDetail[] = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.problem_type || ticket.category || 'Outros',
        created_at: ticket.created_at,
        user_name: ticket.user?.full_name || ticket.user?.username || 'Usuário',
        user_email: ticket.user?.email || 'usuario@empresa.com',
        equipment_id: ticket.equipment_id || 'N/A',
        sla_deadline: ticket.sla_deadline || ticket.created_at,
        estimated_time: ticket.estimated_time || 30,
        assigned_technician_id: ticket.assigned_technician_id,
        user_id: ticket.user_id,
        history: ticket.history || [],
        attachments: ticket.attachments || []
      }))
      
      setTickets(formattedTickets)
      if (formattedTickets.length > 0 && !selectedTicket) {
        setSelectedTicket(formattedTickets[0])
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar chamados resolvidos:', error.response?.data || error.message)
      const errorMessage = handleApiError(error)
      showErrorToast(`Erro ao carregar chamados: ${errorMessage}`)
      setError(errorMessage)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    if (filter === 'resolved') return ticket.status === 'resolved'
    if (filter === 'closed') return ticket.status === 'closed'
    return true
  })

  if (loading) {
    return <LoadingSpinner size="large" message="Carregando gerenciamento de chamados..." fullScreen={false} />
  }

  return (
    <div className="assigned-tickets">
      <div className="section-header">
        <h1>📋 Gerenciar Chamados</h1>
        <p className="section-subtitle">Chamados resolvidos por você</p>
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
            onClick={fetchTickets}
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

      {!loading && !error && tickets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>Nenhum chamado resolvido</h3>
          <p>Você ainda não resolveu nenhum chamado.</p>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <>
          {/* Filtros */}
          <div className="filters-section">
            <div className="filter-controls">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">Todos</option>
                <option value="resolved">Resolvidos</option>
                <option value="closed">Fechados</option>
              </select>
              <button 
                className="action-btn primary" 
                onClick={fetchTickets}
                disabled={loading}
              >
                🔄 Atualizar
              </button>
            </div>
          </div>

          {/* Cards de Chamados */}
          <div className="tickets-grid">
            {filteredTickets.map(ticket => (
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
                    <div className="status-badge" style={{ backgroundColor: statusConfig[ticket.status as keyof typeof statusConfig]?.color || '#6B7280' }}>
                      {statusConfig[ticket.status as keyof typeof statusConfig]?.icon} {statusConfig[ticket.status as keyof typeof statusConfig]?.label}
                    </div>
                    <div className="priority-badge" style={{ backgroundColor: priorityConfig[ticket.priority]?.color || '#10B981' }}>
                      {priorityConfig[ticket.priority]?.label}
                    </div>
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
                      <strong>📅 Criado:</strong> {formatDateTime(ticket.created_at).split(' ')[0]}
                    </div>
                    <div className="detail-item">
                      <strong>⏰ Tempo estimado:</strong> {ticket.estimated_time} min
                    </div>
                  </div>
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
            ))}
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
                    <div className="status-badge" style={{ backgroundColor: statusConfig[selectedTicket.status as keyof typeof statusConfig]?.color || '#6B7280' }}>
                      {statusConfig[selectedTicket.status as keyof typeof statusConfig]?.icon} {statusConfig[selectedTicket.status as keyof typeof statusConfig]?.label}
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
                  <span className="info-label">E-mail:</span>
                  <span className="info-value">{selectedTicket.user_email}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Aberto em:</span>
                  <span className="info-value">{formatDateTime(selectedTicket.created_at)}</span>
                </div>

                {selectedTicket.equipment_id && (
                  <div className="info-row">
                    <span className="info-label">Equipamento:</span>
                    <span className="info-value">{selectedTicket.equipment_id}</span>
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

                  <div className="progress-item current">
                    <div className="progress-icon">⏳</div>
                    <div className="progress-content">
                      <div className="progress-title">Na Fila de Atendimento</div>
                      <div className="progress-description">Este chamado está aguardando um técnico pegar da fila.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações de Resolução */}
              {selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? (
                <div className="ticket-resolved-info">
                  <h4>✅ Chamado Resolvido</h4>
                  <p>Este chamado foi resolvido por você.</p>
                </div>
              ) : null}

              {/* Anexos */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <AttachmentViewer
                  attachments={selectedTicket.attachments.map((att: any) => {
                    // Se attachment é uma string, criar objeto básico
                    if (typeof att === 'string') {
                      return {
                        id: 0,
                        filename: att,
                        url: '',
                        size: 0,
                        type: '',
                        created_at: ''
                      }
                    }
                    // Se attachment é um objeto
                    return {
                      id: att.id,
                      filename: att.filename || att.name || 'Arquivo',
                      url: att.url || att.path,
                      size: att.size || 0,
                      type: att.type || att.mime_type || '',
                      created_at: att.created_at
                    }
                  })}
                  ticketId={selectedTicket.id}
                  canDelete={false}
                />
              )}

              {/* Histórico */}
              {selectedTicket.history && selectedTicket.history.length > 0 && (
                <div className="comments-section">
                  <h4>📜 Histórico</h4>
                  <div className="comments-list">
                    {selectedTicket.history.map(entry => (
                      <div key={entry.id} className="comment">
                        <div className="comment-header">
                          <span className="comment-author">{entry.technician_name}</span>
                          <span className="comment-date">{formatDateTime(entry.timestamp)}</span>
                        </div>
                        <p className="comment-text">{entry.description}</p>
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


export default TicketManagement
