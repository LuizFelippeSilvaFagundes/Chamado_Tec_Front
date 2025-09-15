import { useState, useEffect } from 'react'
import { formatDateTime, formatDateOnly } from '../utils/dateUtils'
import DateTestModal from './DateTestModal'
import './MyTickets.css'

interface Ticket {
  id: number
  title: string
  description: string
  problem_type: string
  location: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in-progress' | 'resolved'
  created_at: string
  updated_at: string
  comments: Comment[]
}

interface Comment {
  id: number
  text: string
  author: string
  created_at: string
  is_technical: boolean
}

const statusConfig = {
  open: { label: 'Aberto', color: '#3B82F6', icon: '🔵' },
  'in-progress': { label: 'Em Andamento', color: '#F59E0B', icon: '🟡' },
  resolved: { label: 'Resolvido', color: '#10B981', icon: '🟢' }
}

const priorityConfig = {
  low: { label: 'Baixa', color: '#10B981' },
  medium: { label: 'Média', color: '#F59E0B' },
  high: { label: 'Alta', color: '#EF4444' }
}

function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDateTest, setShowDateTest] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    problemType: '',
    search: ''
  })

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Token não encontrado')
          return
        }

        const res = await fetch('http://127.0.0.1:8000/tickets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error('Erro ao buscar tickets')
        }

        const data = await res.json()
        setTickets(data)
        setFilteredTickets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [filters, tickets])

  const filterTickets = () => {
    let filtered = [...tickets]

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status)
    }

    if (filters.problemType) {
      filtered = filtered.filter(ticket => ticket.problem_type === filters.problemType)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      )
    }

    setFilteredTickets(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTicket(null)
  }

  // Usando a função utilitária para formatação de datas

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'open': return 25
      case 'in-progress': return 75
      case 'resolved': return 100
      default: return 0
    }
  }

  return (
    <div className="my-tickets">
      <div className="section-header">
        <h1>📋 Meus Chamados</h1>
        <p>Acompanhe o status e histórico dos seus chamados</p>
      </div>

      {loading && (
        <div className="loading-message">
          🔄 Carregando seus tickets...
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="empty-state">
          📭 Você ainda não tem tickets. <br />
          Clique em "Abrir Novo Chamado" para criar seu primeiro ticket!
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <>
          {/* Filtros */}
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Buscar por título ou descrição..."
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
                <option value="in-progress">Em Andamento</option>
                <option value="resolved">Resolvido</option>
              </select>

              <select
                value={filters.problemType}
                onChange={(e) => handleFilterChange('problemType', e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="TI / Computador">TI / Computador</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Iluminação">Iluminação</option>
                <option value="Segurança">Segurança</option>
                <option value="Outros">Outros</option>
              </select>

              <button 
                onClick={() => setShowDateTest(true)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                title="Testar formatação de datas"
              >
                🧪 Testar Datas
              </button>
            </div>
          </div>

          {/* Lista de Chamados */}
          <div className="tickets-table-container">
            {filteredTickets.length === 0 ? (
              <div className="no-tickets">
                <p>Nenhum chamado encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="tickets-table">
                {/* Header da tabela */}
                <div className="table-header">
                  <div className="table-cell header-cell">ID</div>
                  <div className="table-cell header-cell">Título</div>
                  <div className="table-cell header-cell">Tipo</div>
                  <div className="table-cell header-cell">Local</div>
                  <div className="table-cell header-cell">Prioridade</div>
                  <div className="table-cell header-cell">Status</div>
                  <div className="table-cell header-cell">Data</div>
                  <div className="table-cell header-cell">Ações</div>
                </div>

                {/* Linhas da tabela */}
                {filteredTickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className="table-row"
                    onClick={() => openTicketDetails(ticket)}
                  >
                    <div className="table-cell">
                      <span className="ticket-id">#{ticket.id}</span>
                    </div>
                    <div className="table-cell title-cell">
                      <div className="ticket-title">
                        <strong>{ticket.title}</strong>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="problem-type">{ticket.problem_type}</span>
                    </div>
                    <div className="table-cell">
                      <span className="location">{ticket.location}</span>
                    </div>
                    <div className="table-cell">
                      <div className="priority-badge" style={{ backgroundColor: priorityConfig[ticket.priority].color }}>
                        {priorityConfig[ticket.priority].label}
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="status-badge" style={{ backgroundColor: statusConfig[ticket.status].color }}>
                        {statusConfig[ticket.status].icon} {statusConfig[ticket.status].label}
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="created-date">{formatDateTime(ticket.created_at)}</span>
                    </div>
                    <div className="table-cell action-cell">
                      <button 
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          openTicketDetails(ticket)
                        }}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                    <div className="status-badge" style={{ backgroundColor: statusConfig[selectedTicket.status].color }}>
                      {statusConfig[selectedTicket.status].icon} {statusConfig[selectedTicket.status].label}
                    </div>
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Prioridade:</span>
                  <span className="info-value">
                    <div className="priority-badge" style={{ backgroundColor: priorityConfig[selectedTicket.priority].color }}>
                      {priorityConfig[selectedTicket.priority].label}
                    </div>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Tipo:</span>
                  <span className="info-value">{selectedTicket.problem_type}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Local:</span>
                  <span className="info-value">{selectedTicket.location}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Aberto em:</span>
                  <span className="info-value">{formatDateTime(selectedTicket.created_at)}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Última atualização:</span>
                  <span className="info-value">{formatDateTime(selectedTicket.updated_at)}</span>
                </div>
              </div>

              <div className="ticket-description-full">
                <h4>Descrição</h4>
                <p>{selectedTicket.description}</p>
              </div>

              {selectedTicket.comments.length > 0 && (
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


      {/* Modal de teste de datas */}
      <DateTestModal 
        isOpen={showDateTest}
        onClose={() => setShowDateTest(false)}
        ticketData={selectedTicket ? {
          created_at: selectedTicket.created_at,
          updated_at: selectedTicket.updated_at
        } : undefined}
      />
    </div>
  )
}

export default MyTickets
