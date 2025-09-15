import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime } from '../../utils/dateUtils'

interface TicketDetail {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  category: string
  created_at: string
  user_name: string
  user_email: string
  equipment_id?: string
  sla_deadline: string
  estimated_time?: number
  history: TicketHistory[]
  attachments: string[]
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
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null)
  const [tickets, setTickets] = useState<TicketDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [newNote, setNewNote] = useState('')
  const [timeSpent, setTimeSpent] = useState('')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Para técnicos, tentar buscar todos os tickets
      const res = await fetch('http://127.0.0.1:8000/tickets?all=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Erro ao buscar chamados')
      }

      const data = await res.json()
      console.log('⚙️ Chamados para gerenciamento:', data)
      
      // Converter os dados da API para o formato esperado pelo componente
      const formattedTickets: TicketDetail[] = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.problem_type,
        created_at: ticket.created_at,
        user_name: ticket.user_name || 'Usuário',
        user_email: ticket.user_email || 'usuario@empresa.com',
        equipment_id: ticket.equipment_id || 'N/A',
        sla_deadline: ticket.sla_deadline || ticket.created_at,
        estimated_time: ticket.estimated_time || 30,
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
      if (formattedTickets.length > 0) {
        setSelectedTicket(formattedTickets[0])
      }
    } catch (error) {
      console.error('Erro ao buscar chamados:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async () => {
    if (!selectedTicket || !newStatus) return

    try {
      // Simulação de atualização - substituir pela chamada real da API
      console.log('Atualizando status do chamado:', selectedTicket.id, newStatus)
      
      // Atualizar o ticket localmente
      const updatedTickets = tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: newStatus as any }
          : ticket
      )
      setTickets(updatedTickets)
      
      // Atualizar o ticket selecionado
      setSelectedTicket({ ...selectedTicket, status: newStatus as any })
      
      // Adicionar ao histórico
      const newHistoryEntry: TicketHistory = {
        id: Date.now(),
        action: 'status_change',
        description: `Status alterado para ${newStatus}`,
        timestamp: new Date().toISOString(),
        technician_name: 'Técnico Atual'
      }
      
      setSelectedTicket({
        ...selectedTicket,
        status: newStatus as any,
        history: [...selectedTicket.history, newHistoryEntry]
      })
      
      // Limpar campos
      setNewStatus('')
      setNewNote('')
      setTimeSpent('')
      
      alert('Status atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do chamado')
    }
  }

  const addNote = async () => {
    if (!selectedTicket || !newNote.trim()) return

    try {
      // Simulação de adição de nota - substituir pela chamada real da API
      console.log('Adicionando nota ao chamado:', selectedTicket.id, newNote)
      
      const newHistoryEntry: TicketHistory = {
        id: Date.now(),
        action: 'note',
        description: newNote,
        timestamp: new Date().toISOString(),
        technician_name: 'Técnico Atual'
      }
      
      setSelectedTicket({
        ...selectedTicket,
        history: [...selectedTicket.history, newHistoryEntry]
      })
      
      setNewNote('')
      alert('Nota adicionada com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar nota:', error)
      alert('Erro ao adicionar nota')
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
      <div className="section-header">
        <h2>⚙️ Gerenciamento de Chamados</h2>
        <div className="section-actions">
          <button className="action-btn primary" onClick={fetchTickets}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="management-layout">
        {/* Lista de chamados */}
        <div className="tickets-list">
          <h3>Chamados Disponíveis</h3>
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
                <h4>🔧 Ações</h4>
                <div className="actions-form">
                  <div className="form-group">
                    <label>Alterar Status:</label>
                    <select 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Selecione um status</option>
                      <option value="pending">Pendente</option>
                      <option value="in-progress">Em Andamento</option>
                      <option value="resolved">Resolvido</option>
                      <option value="closed">Fechado</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Adicionar Nota:</label>
                    <textarea 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Digite uma nota sobre o atendimento..."
                      className="form-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tempo Gasto (minutos):</label>
                    <input 
                      type="number"
                      value={timeSpent}
                      onChange={(e) => setTimeSpent(e.target.value)}
                      placeholder="Ex: 30"
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      className="action-btn primary"
                      onClick={updateTicketStatus}
                      disabled={!newStatus}
                    >
                      ✅ Atualizar Status
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={addNote}
                      disabled={!newNote.trim()}
                    >
                      📝 Adicionar Nota
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
