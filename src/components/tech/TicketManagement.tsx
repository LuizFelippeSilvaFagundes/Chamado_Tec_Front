import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime } from '../../utils/dateUtils'
import { getAvailableTickets, takeTicket, updateTicketStatus } from '../../api/api'
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

interface TicketManagementProps {
  onTicketTaken?: () => void
}

function TicketManagement({ onTicketTaken }: TicketManagementProps) {
  const { token, user } = useAuth()
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const [tickets, setTickets] = useState<TicketDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [takingTicket, setTakingTicket] = useState<number | null>(null)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [])
  
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

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({type, message})
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Buscar apenas tickets disponíveis (não atribuídos) para a fila
      const response = await getAvailableTickets(token)
      const data = response.data
      console.log('📋 Tickets na fila (não atribuídos):', data)
      
      // Converter os dados da API para o formato esperado pelo componente
      const formattedTickets: TicketDetail[] = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.problem_type,
        created_at: ticket.created_at,
        user_name: ticket.user?.full_name || ticket.user?.username || 'Usuário',
        user_email: ticket.user?.email || 'usuario@empresa.com',
        equipment_id: ticket.equipment_id || 'N/A',
        sla_deadline: ticket.sla_deadline || ticket.created_at,
        estimated_time: ticket.estimated_time || 30,
        assigned_technician_id: ticket.assigned_technician_id,
        user_id: ticket.user_id,
        history: ticket.history || [
          {
            id: 1,
            action: 'created',
            description: 'Chamado criado pelo usuário',
            timestamp: ticket.created_at,
            technician_name: 'Sistema'
          }
        ],
        attachments: ticket.attachments || []
      }))
      
      setTickets(formattedTickets)
      if (formattedTickets.length > 0 && !selectedTicket) {
        setSelectedTicket(formattedTickets[0])
      }
    } catch (error) {
      console.error('Erro ao buscar chamados da fila:', error)
      showNotification('error', 'Erro ao carregar fila de chamados')
    } finally {
      setLoading(false)
    }
  }

  // Função para pegar um ticket da fila
  const handleTakeTicket = async () => {
    if (!selectedTicket) return

    try {
      setTakingTicket(selectedTicket.id)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      await takeTicket(token, selectedTicket.id)
      
      // Remover ticket da fila local
      const updatedTickets = tickets.filter(ticket => ticket.id !== selectedTicket.id)
      setTickets(updatedTickets)
      
      // Selecionar próximo ticket da fila
      if (updatedTickets.length > 0) {
        setSelectedTicket(updatedTickets[0])
      } else {
        setSelectedTicket(null)
      }
      
      showNotification('success', '✅ Chamado atribuído! Redirecionando para "Meus Chamados"...')
      
      // Redirecionar para "Meus Chamados" após 1.5 segundos
      setTimeout(() => {
        if (onTicketTaken) {
          onTicketTaken()
        }
      }, 1500)
    } catch (error) {
      console.error('Erro ao pegar ticket:', error)
      showNotification('error', '❌ Erro ao pegar chamado. Tente novamente.')
    } finally {
      setTakingTicket(null)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando gerenciamento de chamados...</p>
      </div>
    )
  }

  return (
    <div className="assigned-tickets">
      {/* Notificação */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="section-header">
        <h1>📥 Fila de Chamados</h1>
        <p className="section-subtitle">Chamados disponíveis para você pegar</p>
      </div>

      {!loading && tickets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Nenhum chamado na fila</h3>
          <p>Todos os chamados foram atribuídos ou não há chamados abertos no momento.</p>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <>
          {/* Filtros */}
          <div className="filters-section">
            <div className="filter-controls">
              <button className="action-btn primary" onClick={fetchTickets}>
                🔄 Atualizar Fila
              </button>
            </div>
          </div>

          {/* Cards de Chamados */}
          <div className="tickets-grid">
            {tickets.map(ticket => (
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

              {/* Ações do Técnico */}
              <div className="ticket-actions-modal">
                <button 
                  className="action-btn take-btn"
                  onClick={handleTakeTicket}
                  disabled={takingTicket === selectedTicket.id}
                >
                  {takingTicket === selectedTicket.id ? '⏳ Pegando...' : '🎯 Pegar Este Chamado'}
                </button>
              </div>

              {/* Anexos */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="ticket-attachments">
                  <h4>📎 Anexos ({selectedTicket.attachments.length})</h4>
                  <div className="attachments-list">
                    {selectedTicket.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="attachment-item">
                        <div className="attachment-icon">📄</div>
                        <div className="attachment-info">
                          <span className="attachment-name">
                            {typeof attachment === 'string' ? attachment : attachment.filename || 'Arquivo anexo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
