import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime, isDateOverdue } from '../../utils/dateUtils'
import { getAssignedTickets, updateTicketStatus } from '../../api/api'
import './AssignedTickets.css'

interface Ticket {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed'
  category: string
  created_at: string
  user_name: string
  equipment_id?: string
  sla_deadline: string
  estimated_time?: number
  assigned_technician_id?: number | null
  user_id: number
  assigned_by_admin?: boolean
}

function AdminAssignedTickets() {
  const { token, user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'in-progress' | 'resolved' | 'closed'>('all')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  useEffect(() => {
    fetchAdminAssignedTickets()
  }, [])

  const fetchAdminAssignedTickets = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Buscar tickets atribuídos ao técnico atual
      const response = await getAssignedTickets(token)
      const data = response.data
      console.log('🎫 Chamados atribuídos pelo admin:', data)
      
      // Converter os dados da API para o formato esperado pelo componente
      const formattedTickets: Ticket[] = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.problem_type,
        created_at: ticket.created_at,
        user_name: ticket.user?.full_name || ticket.user?.username || 'Usuário',
        equipment_id: ticket.equipment_id || 'N/A',
        sla_deadline: ticket.sla_deadline || ticket.created_at,
        estimated_time: ticket.estimated_time || 30,
        assigned_technician_id: ticket.assigned_technician_id,
        user_id: ticket.user_id,
        assigned_by_admin: ticket.assigned_by_admin || false
      }))
      
      setTickets(formattedTickets)
    } catch (error) {
      console.error('Erro ao buscar tickets atribuídos pelo admin:', error)
      showNotification('error', 'Erro ao carregar chamados atribuídos pelo admin')
    } finally {
      setLoading(false)
    }
  }

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({type, message})
    setTimeout(() => setNotification(null), 3000)
  }

  // Função para atualizar status
  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      if (!token) {
        throw new Error('Token não encontrado')
      }

      await updateTicketStatus(token, ticketId, newStatus)
      
      // Recarregar tickets
      await fetchAdminAssignedTickets()
      
      showNotification('success', `✅ Status atualizado para: ${newStatus}`)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showNotification('error', '❌ Erro ao atualizar status.')
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    return ticket.status === filter
  })

  // Função para determinar cor do status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return 'status-new'
      case 'pending': return 'status-pending'  
      case 'in-progress': return 'status-progress'
      case 'resolved': return 'status-resolved'
      case 'closed': return 'status-closed'
      default: return 'status-default'
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando chamados atribuídos pelo admin...</p>
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
        <h2>👑 Chamados Atribuídos pelo Admin</h2>
        <p className="section-subtitle">Chamados que foram atribuídos diretamente pelo administrador</p>
        <div className="section-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="in-progress">Em Andamento</option>
            <option value="resolved">Resolvidos</option>
            <option value="closed">Fechados</option>
          </select>
          <button className="action-btn primary" onClick={fetchAdminAssignedTickets}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Chamados do Admin</h3>
          <div className="stat-value">{tickets.length}</div>
        </div>
        <div className="stat-card">
          <h3>⏳ Pendentes</h3>
          <div className="stat-value new">{tickets.filter(t => t.status === 'pending').length}</div>
        </div>
        <div className="stat-card">
          <h3>🔄 Em Andamento</h3>
          <div className="stat-value progress">{tickets.filter(t => t.status === 'in-progress').length}</div>
        </div>
        <div className="stat-card">
          <h3>✅ Resolvidos</h3>
          <div className="stat-value resolved">{tickets.filter(t => t.status === 'resolved').length}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="tech-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Usuário</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>SLA</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className={getStatusClass(ticket.status)}>
                <td>
                  #{ticket.id}
                  {ticket.assigned_by_admin && (
                    <span className="admin-badge" title="Atribuído pelo admin">👑</span>
                  )}
                </td>
                <td>
                  <div className="ticket-title">
                    <strong>{ticket.title}</strong>
                    <small>{ticket.category}</small>
                  </div>
                </td>
                <td>{ticket.user_name}</td>
                <td>
                  <span className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <span className={getStatusColor(ticket.status)}>
                    {ticket.status === 'open' ? 'Novo' : 
                     ticket.status === 'in-progress' ? 'Em Andamento' : 
                     ticket.status === 'resolved' ? 'Resolvido' : 
                     ticket.status === 'closed' ? 'Fechado' : ticket.status}
                  </span>
                </td>
                <td>
                  <small>{formatDateTime(ticket.created_at)}</small>
                </td>
                <td>
                  <div className="sla-info">
                    <span className={isDateOverdue(ticket.sla_deadline) ? 'sla-overdue' : 'sla-normal'}>
                      {formatDateTime(ticket.sla_deadline)}
                    </span>
                    {isDateOverdue(ticket.sla_deadline) && (
                      <span className="sla-warning">⚠️ Vencido</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn primary" title="Ver detalhes">
                      👁️
                    </button>
                    
                    {/* Ações baseadas no status */}
                    {ticket.status === 'open' && (
                      <button 
                        className="action-btn secondary" 
                        title="Iniciar atendimento"
                        onClick={() => handleStatusChange(ticket.id, 'in-progress')}
                      >
                        ▶️ Iniciar
                      </button>
                    )}
                    
                    {ticket.status === 'in-progress' && (
                      <button 
                        className="action-btn success" 
                        title="Marcar como resolvido"
                        onClick={() => handleStatusChange(ticket.id, 'resolved')}
                      >
                        ✅ Resolver
                      </button>
                    )}
                    
                    {ticket.status === 'resolved' && (
                      <button 
                        className="action-btn info" 
                        title="Fechar chamado"
                        onClick={() => handleStatusChange(ticket.id, 'closed')}
                      >
                        🔒 Fechar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTickets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👑</div>
          <h3>Nenhum chamado atribuído pelo admin</h3>
          <p>Você ainda não possui chamados atribuídos diretamente pelo administrador.</p>
        </div>
      )}
    </div>
  )
}

export default AdminAssignedTickets
