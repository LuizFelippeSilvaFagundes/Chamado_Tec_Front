import { useState, useEffect } from 'react'
import { formatDateTime, formatDateOnly } from '../utils/dateUtils'
import DateTestModal from './DateTestModal'
import AttachmentViewer from './AttachmentViewer'
import LoadingSpinner from './LoadingSpinner'
import SkeletonLoader from './SkeletonLoader'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import './MyTickets.css'

interface Attachment {
  filename: string
  stored_filename: string
  url: string
  size: number
  type: string
}

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
  attachments?: Attachment[] | null
  assigned_tech?: {
    id: number
    full_name: string
    avatar_url?: string
  }
}

interface Comment {
  id: number
  text: string
  author: string
  created_at: string
  is_technical: boolean
}

const statusConfig = {
  open: { label: 'Aberto', color: '#EF4444', icon: '❓' },
  'in-progress': { label: 'Em Atendimento', color: '#3B82F6', icon: '🕒' },
  resolved: { label: 'Encerrado', color: '#10B981', icon: '✅' }
}

const priorityConfig = {
  low: { label: 'Baixa', color: '#10B981' },
  medium: { label: 'Média', color: '#F59E0B' },
  high: { label: 'Alta', color: '#EF4444' }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

function MyTickets() {
  const { showError: showErrorToast } = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
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
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        console.log('🔍 Dados do usuário no localStorage:', userData)
        
        if (!userData.username) {
          console.error('❌ Username não encontrado no localStorage')
          showErrorToast('Usuário não encontrado. Faça login novamente.')
          setLoading(false)
          return
        }

        console.log('🔍 Buscando tickets para usuário:', userData.username)
        const res = await fetch(`http://127.0.0.1:8000/tickets/me/${userData.username}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('🔍 Resposta da API:', res.status)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          const errorMessage = handleApiError({ ...errorData, status: res.status })
          throw new Error(errorMessage)
        }

        const data = await res.json()
        console.log('✅ Tickets recebidos:', data)
        setTickets(data)
        setFilteredTickets(data)
      } catch (err) {
        console.error('❌ Erro completo:', err)
        const errorMessage = handleApiError(err)
        showErrorToast(errorMessage)
        setTickets([])
        setFilteredTickets([])
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

  return (
    <div className="my-tickets">
      <div className="section-header">
        <h1>📋 Meus Chamados</h1>
      </div>

      {loading ? (
        <div style={{ padding: '2rem' }}>
          <LoadingSpinner size="large" message="Carregando seus chamados..." />
          <div style={{ marginTop: '2rem' }}>
            <SkeletonLoader type="card" count={3} />
          </div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          📭 Você ainda não tem tickets. <br />
          Clique em "Abrir Novo Chamado" para criar seu primeiro ticket!
        </div>
      ) : (
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
                  <div className="table-cell header-cell">Atualizado em</div>
                  <div className="table-cell header-cell">Id</div>
                  <div className="table-cell header-cell">Título</div>
                  <div className="table-cell header-cell">Serviço</div>
                  <div className="table-cell header-cell">Técnico</div>
                  <div className="table-cell header-cell">Status</div>
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
                      <span className="updated-date">{formatDateOnly(ticket.updated_at)}</span>
                    </div>
                    <div className="table-cell">
                      <span className="ticket-id">{String(ticket.id).padStart(5, '0')}</span>
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
                      {ticket.assigned_tech ? (
                        <div className="tech-info">
                          {ticket.assigned_tech.avatar_url ? (
                            <img 
                              src={`http://127.0.0.1:8000${ticket.assigned_tech.avatar_url}`}
                              alt={ticket.assigned_tech.full_name}
                              className="tech-avatar"
                            />
                          ) : (
                            <div className="tech-avatar-initials">
                              {getInitials(ticket.assigned_tech.full_name)}
                            </div>
                          )}
                          <span className="tech-name">{ticket.assigned_tech.full_name}</span>
                        </div>
                      ) : (
                        <span className="no-tech">Não atribuído</span>
                      )}
                    </div>
                    <div className="table-cell">
                      <div className="status-badge" style={{ backgroundColor: statusConfig[ticket.status].color }}>
                        {statusConfig[ticket.status].icon} {statusConfig[ticket.status].label}
                      </div>
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

              {/* Seção de Progresso */}
              <div className="ticket-progress-section">
                <h4>📊 Acompanhar Progresso</h4>
                <div className="progress-timeline">
                  <div className="progress-item completed">
                    <div className="progress-icon">✅</div>
                    <div className="progress-content">
                      <div className="progress-title">Chamado Aberto</div>
                      <div className="progress-date">{formatDateTime(selectedTicket.created_at)}</div>
                      <div className="progress-description">Seu chamado foi criado e está aguardando atribuição a um técnico.</div>
                    </div>
                  </div>

                  {selectedTicket.assigned_tech && (
                    <div className={`progress-item ${selectedTicket.status !== 'open' ? 'completed' : 'current'}`}>
                      <div className="progress-icon">👨‍🔧</div>
                      <div className="progress-content">
                        <div className="progress-title">Técnico Atribuído</div>
                        <div className="progress-description">
                          O técnico <strong>{selectedTicket.assigned_tech.full_name}</strong> foi atribuído ao seu chamado.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'in-progress' && (
                    <div className="progress-item current">
                      <div className="progress-icon">🔧</div>
                      <div className="progress-content">
                        <div className="progress-title">Em Atendimento</div>
                        <div className="progress-date">{formatDateTime(selectedTicket.updated_at)}</div>
                        <div className="progress-description">O técnico está trabalhando na resolução do seu chamado.</div>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'resolved' && (
                    <div className="progress-item completed">
                      <div className="progress-icon">✅</div>
                      <div className="progress-content">
                        <div className="progress-title">Chamado Resolvido</div>
                        <div className="progress-date">{formatDateTime(selectedTicket.updated_at)}</div>
                        <div className="progress-description">Seu chamado foi concluído com sucesso!</div>
                      </div>
                    </div>
                  )}

                  {selectedTicket.status === 'open' && !selectedTicket.assigned_tech && (
                    <div className="progress-item current">
                      <div className="progress-icon">⏳</div>
                      <div className="progress-content">
                        <div className="progress-title">Aguardando Atribuição</div>
                        <div className="progress-description">Estamos procurando o técnico mais adequado para atender seu chamado.</div>
                      </div>
                    </div>
                  )}
                </div>
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

              {selectedTicket.comments.length > 0 && (
                <div className="comments-section">
                  <h4>💬 Atualizações do Técnico</h4>
                  <div className="comments-list">
                    {selectedTicket.comments.map(comment => (
                      <div key={comment.id} className={`comment ${comment.is_technical ? 'technical' : ''}`}>
                        <div className="comment-header">
                          <span className="comment-author">
                            {comment.is_technical ? '👨‍🔧 ' : '👤 '}{comment.author}
                          </span>
                          <span className="comment-date">{formatDateTime(comment.created_at)}</span>
                          {comment.is_technical && <span className="technical-badge">✓ Técnico</span>}
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="comments-info">
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
                      {selectedTicket.comments.filter(c => c.is_technical).length > 0 
                        ? '✓ O técnico já atualizou seu chamado' 
                        : 'Aguardando atualizações do técnico'}
                    </p>
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
