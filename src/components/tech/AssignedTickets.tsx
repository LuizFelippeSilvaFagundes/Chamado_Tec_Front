import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatDateTime, isDateOverdue } from '../../utils/dateUtils'

interface Ticket {
  id: number
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in-progress' | 'resolved' | 'closed'
  category: string
  created_at: string
  user_name: string
  equipment_id?: string
  sla_deadline: string
  estimated_time?: number
}

function AssignedTickets() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all')

  useEffect(() => {
    fetchAssignedTickets()
  }, [])

  const fetchAssignedTickets = async () => {
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
      console.log('📋 Chamados recebidos pela API:', data)
      
      // Converter os dados da API para o formato esperado pelo componente
      const formattedTickets: Ticket[] = data.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.problem_type,
        created_at: ticket.created_at,
        user_name: ticket.user_name || 'Usuário',
        equipment_id: ticket.equipment_id || 'N/A',
        sla_deadline: ticket.sla_deadline || ticket.created_at,
        estimated_time: ticket.estimated_time || 30
      }))
      
      setTickets(formattedTickets)
    } catch (error) {
      console.error('Erro ao buscar chamados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    return ticket.status === filter
  })

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

  // Usando as funções utilitárias para formatação de datas

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
      <div className="section-header">
        <h2>🎫 Chamados Atribuídos</h2>
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
          </select>
          <button className="action-btn primary" onClick={fetchAssignedTickets}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Atribuídos</h3>
          <div className="stat-value">{tickets.length}</div>
        </div>
        <div className="stat-card">
          <h3>Pendentes</h3>
          <div className="stat-value">{tickets.filter(t => t.status === 'pending').length}</div>
        </div>
        <div className="stat-card">
          <h3>Em Andamento</h3>
          <div className="stat-value">{tickets.filter(t => t.status === 'in-progress').length}</div>
        </div>
        <div className="stat-card">
          <h3>SLA Vencido</h3>
          <div className="stat-value urgent">{tickets.filter(t => isDateOverdue(t.sla_deadline)).length}</div>
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
              <th>Equipamento</th>
              <th>SLA</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>#{ticket.id}</td>
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
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.equipment_id || 'N/A'}</td>
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
                    <button className="action-btn secondary" title="Iniciar atendimento">
                      ▶️
                    </button>
                    <button className="action-btn success" title="Marcar como resolvido">
                      ✅
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTickets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Nenhum chamado encontrado</h3>
          <p>Não há chamados que correspondam aos filtros selecionados.</p>
        </div>
      )}
    </div>
  )
}

export default AssignedTickets
