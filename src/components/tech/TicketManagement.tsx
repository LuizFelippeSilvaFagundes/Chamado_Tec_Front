import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime } from '../../utils/dateUtils'
import { getAvailableTickets, takeTicket, updateTicketStatus } from '../../api/api'

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
  const { token, user } = useAuth()
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const [tickets, setTickets] = useState<TicketDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [takingTicket, setTakingTicket] = useState<number | null>(null)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

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
      
      showNotification('success', '✅ Chamado atribuído! Agora está em "Meus Chamados"')
    } catch (error) {
      console.error('Erro ao pegar ticket:', error)
      showNotification('error', '❌ Erro ao pegar chamado. Tente novamente.')
    } finally {
      setTakingTicket(null)
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
      case 'pending': return 'status-badge pending'
      case 'in-progress': return 'status-badge in-progress'
      case 'resolved': return 'status-badge resolved'
      case 'closed': return 'status-badge closed'
      default: return 'status-badge pending'
    }
  }

  // Usando a função utilitária para formatação de datas

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando gerenciamento de chamados...</p>
      </div>
    )
  }

  return (
    <div className="ticket-management">
      {/* Notificação */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="section-header">
        <h2>📋 Fila de Chamados</h2>
        <div className="section-actions">
          <button className="action-btn primary" onClick={fetchTickets}>
            🔄 Atualizar Fila
          </button>
        </div>
      </div>

      <div className="management-layout">
        {/* Lista de chamados */}
        <div className="tickets-list">
          <h3>📥 Fila de Chamados ({tickets.length})</h3>
          <div className="tickets-grid">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id}
                className={`ticket-card ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-header">
                  <span className="ticket-id">#{ticket.id}</span>
                  <span className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </span>
                </div>
                <h4>{ticket.title}</h4>
                <p className="ticket-user">{ticket.user_name}</p>
                <span className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes do chamado selecionado */}
        {selectedTicket && (
          <div className="ticket-details">
            <div className="details-header">
              <h3>Detalhes do Chamado #{selectedTicket.id}</h3>
              <span className={getStatusColor(selectedTicket.status)}>
                {selectedTicket.status}
              </span>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h4>📋 Informações Básicas</h4>
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
                    <label>Equipamento:</label>
                    <span>{selectedTicket.equipment_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Usuário:</label>
                    <span>{selectedTicket.user_name} ({selectedTicket.user_email})</span>
                  </div>
                  <div className="detail-item">
                    <label>Criado em:</label>
                    <span>{formatDateTime(selectedTicket.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>📝 Descrição</h4>
                <div className="description-box">
                  {selectedTicket.description}
                </div>
              </div>

              <div className="detail-section">
                <h4>📎 Anexos</h4>
                <div className="attachments-list">
                  {selectedTicket.attachments.length > 0 ? (
                    selectedTicket.attachments.map((attachment, index) => (
                      <div key={index} className="attachment-item">
                        📎 {attachment}
                      </div>
                    ))
                  ) : (
                    <p className="no-attachments">Nenhum anexo</p>
                  )}
                </div>
              </div>

              {/* Ações do técnico */}
              <div className="detail-section">
                <h4>🎯 Pegar da Fila</h4>
                <div className="actions-form">
                  <div className="take-ticket-section">
                    <p>Este chamado está na fila de espera. Clique no botão abaixo para assumir o atendimento:</p>
                    <button 
                      className="action-btn take-btn"
                      onClick={handleTakeTicket}
                      disabled={takingTicket === selectedTicket.id}
                    >
                      {takingTicket === selectedTicket.id ? '⏳ Pegando...' : '🎯 Pegar Este Chamado'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Histórico */}
              <div className="detail-section">
                <h4>📜 Histórico</h4>
                <div className="history-timeline">
                  {selectedTicket.history.map((entry) => (
                    <div key={entry.id} className="history-item">
                      <div className="history-time">
                        {formatDateTime(entry.timestamp)}
                      </div>
                      <div className="history-content">
                        <strong>{entry.technician_name}</strong>
                        <p>{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketManagement
