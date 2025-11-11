import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AvatarUpload from '../components/AvatarUpload'
import AdminSLAMonitoring from '../components/admin/AdminSLAMonitoring'
import './AdminDashboard.css'
import { getTicketHistory, getTicketComments, updateTicket } from '../api/api'
import EditTicketModal from '../components/admin/EditTicketModal'
import NotificationCenter from '../components/NotificationCenter'
import KnowledgeBase from '../components/KnowledgeBase'
import { createLocalNotification } from '../contexts/NotificationContext'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('chamados-abertos')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Usar avatar diretamente do contexto (atualiza automaticamente)
  const userAvatarUrl = user?.avatar_url

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowAccountModal(false)
      }
    }

    if (showAccountModal) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAccountModal])

  const getUserInitials = () => {
    if (!user?.full_name) return 'UA'
    return user.full_name
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  const handleAvatarUpdate = () => {
    // O contexto já foi atualizado pelo AvatarUpload
    setShowAvatarModal(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chamados-abertos':
        return <ChamadosAbertosList />
      case 'chamados':
        return <ChamadosList />
      case 'tecnicos':
        return <TecnicosList />
      case 'clientes':
        return <ClientesList />
      case 'servicos':
        return <ServicosList />
      case 'sla-produtividade':
        return <AdminSLAMonitoring />
      case 'base-conhecimento':
        return <KnowledgeBase canEdit={true} />
      default:
        return <ChamadosAbertosList />
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="brand-name">Chamados</span>
              <span className="brand-role">ADMIN</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'chamados-abertos' ? 'active' : ''}`}
            onClick={() => setActiveTab('chamados-abertos')}
          >
            <span className="nav-icon">🔓</span>
            <span className="nav-text">Chamados Abertos</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'chamados' ? 'active' : ''}`}
            onClick={() => setActiveTab('chamados')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Chamados</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'tecnicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('tecnicos')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Técnicos</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('clientes')}
          >
            <span className="nav-icon">💼</span>
            <span className="nav-text">Clientes</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'servicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('servicos')}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">Serviços</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'sla-produtividade' ? 'active' : ''}`}
            onClick={() => setActiveTab('sla-produtividade')}
          >
            <span className="nav-icon">⏱️</span>
            <span className="nav-text">SLA & Produtividade</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'base-conhecimento' ? 'active' : ''}`}
            onClick={() => setActiveTab('base-conhecimento')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">Base de Conhecimento</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="sidebar-user">
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0 1rem' }}>
            <NotificationCenter />
            <button className="avatar-button" onClick={() => setShowAccountModal(true)}>
              {userAvatarUrl ? (
                <img 
                  src={`http://127.0.0.1:8000${userAvatarUrl}`}
                  alt="Avatar"
                  className="user-avatar"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div className="user-avatar">{getUserInitials()}</div>
              )}
              <span className="user-short-name">{user?.full_name || 'Usuário Adm'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {renderContent()}
      </div>

      {/* Modal de Perfil */}
      {showAccountModal && (
        <div className="account-popover" ref={popoverRef}>
          <div className="account-popover-title">Opções</div>
          <button 
            className="account-popover-item" 
            onClick={() => {
              setShowAccountModal(false)
              setShowAvatarModal(true)
            }}
          >
            <img className="item-icon-img" src="/src/assets/icons/circle-user.svg" alt="perfil" />
            <span>Alterar Foto</span>
          </button>
          <button 
            className="account-popover-item danger" 
            onClick={handleLogout}
          >
            <img className="item-icon-img" src="/src/assets/icons/log-out.svg" alt="sair" />
            <span>Sair</span>
          </button>
        </div>
      )}

      {/* Modal de Avatar com Crop */}
      {showAvatarModal && (
        <AvatarUpload 
          onClose={() => setShowAvatarModal(false)}
          onAvatarUpdate={handleAvatarUpdate}
        />
      )}
    </div>
  )
}

// Componente de Lista de Chamados
function ChamadosList() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [chamados, setChamados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChamado, setSelectedChamado] = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchChamados()
  }, [])

  const fetchChamados = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Buscar apenas chamados que já foram atribuídos a técnicos
      const res = await fetch('http://127.0.0.1:8000/admin/tickets/assigned', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Erro ao buscar chamados atribuídos')
      }

      const data = await res.json()
      console.log('📋 Chamados atribuídos recebidos pela API:', data)
      
      // Filtrar apenas chamados que têm técnico atribuído
      const assignedTickets = data.filter((ticket: any) => ticket.assigned_technician_id)
      
      const formattedChamados = assignedTickets.map((ticket: any) => ({
        id: ticket.id.toString().padStart(5, '0'),
        titulo: ticket.title,
        servico: ticket.problem_type,
        cliente: { 
          nome: ticket.user?.full_name || ticket.user?.username || 'Usuário', 
          avatar: (ticket.user?.full_name || ticket.user?.username || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()
        },
        tecnico: { 
          nome: ticket.assigned_technician?.full_name || ticket.assigned_technician?.username || 'Não atribuído', 
          avatar: (ticket.assigned_technician?.full_name || ticket.assigned_technician?.username || 'N').split(' ').map((n: string) => n[0]).join('').toUpperCase()
        },
        status: getStatusLabel(ticket.status),
        atualizado: formatDateTime(ticket.updated_at || ticket.created_at),
        assigned_by_admin: ticket.assigned_by_admin || false
      }))
      
      setChamados(formattedChamados)
    } catch (error) {
      console.error('Erro ao buscar chamados atribuídos:', error)
      // Fallback para dados mockados em caso de erro
      setChamados([
        {
          id: '00003',
          titulo: 'Rede lenta',
          servico: 'Instalação de Rede',
          cliente: { nome: 'André Costa', avatar: 'AC' },
          tecnico: { nome: 'Carlos Silva', avatar: 'CS' },
          status: 'Em atendimento',
          atualizado: '13/04/25 20:56',
          assigned_by_admin: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto'
      case 'in-progress': return 'Em atendimento'
      case 'resolved': return 'Encerrado'
      default: return status
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Data não disponível'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Data inválida'
    }
  }

  const openChamadoModal = (chamado: any) => {
    setSelectedChamado(chamado)
    setShowModal(true)
  }

  const closeChamadoModal = () => {
    setSelectedChamado(null)
    setShowModal(false)
  }


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <span className="status-badge aberto">❓ Aberto</span>
      case 'Em atendimento':
        return <span className="status-badge em-atendimento">🕐 Em atendimento</span>
      case 'Encerrado':
        return <span className="status-badge encerrado">✅ Encerrado</span>
      default:
        return <span className="status-badge">{status}</span>
    }
  }

  return (
    <div className="chamados-container">
      <h1 className="page-title">Chamados Atribuídos</h1>
      <p className="page-subtitle">Chamados que já foram atribuídos aos técnicos</p>
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando chamados...</p>
        </div>
      ) : (
        <div className="chamados-cards-grid">
          {chamados.length === 0 ? (
            <div className="no-chamados">
              <div className="no-chamados-icon">📋</div>
              <h3>Nenhum chamado atribuído</h3>
              <p>Não há chamados atribuídos aos técnicos no momento.</p>
            </div>
          ) : (
            chamados.map((chamado) => (
              <div 
                key={chamado.id} 
                className="chamado-card"
                onClick={() => openChamadoModal(chamado)}
              >
                <div className="chamado-card-header">
                  <div className="chamado-id">#{chamado.id}</div>
                  <div className="status-container">
                    {getStatusBadge(chamado.status)}
                    {chamado.assigned_by_admin && (
                      <span className="admin-assigned-badge">👑 Admin</span>
                    )}
                  </div>
                </div>

                <div className="chamado-card-content">
                  <h3 className="chamado-title">{chamado.titulo}</h3>
                  <p className="chamado-servico">{chamado.servico}</p>
                  
                  <div className="chamado-meta">
                    <div className="chamado-date">
                      <span className="meta-label">Atualizado:</span>
                      <span className="meta-value">{chamado.atualizado}</span>
                    </div>
                  </div>
                </div>

                <div className="chamado-card-footer">
                  <div className="chamado-users">
                    <div className="user-info">
                      <div className="user-avatar cliente">{chamado.cliente.avatar}</div>
                      <div className="user-details">
                        <span className="user-label">Cliente</span>
                        <span className="user-name">{chamado.cliente.nome}</span>
                      </div>
                    </div>
                    <div className="user-info">
                      <div className="user-avatar tecnico">{chamado.tecnico.avatar}</div>
                      <div className="user-details">
                        <span className="user-label">Técnico</span>
                        <span className="user-name">{chamado.tecnico.nome}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && selectedChamado && (
        <div className="modal-overlay" onClick={closeChamadoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedChamado.titulo}</h2>
              <button className="close-btn" onClick={closeChamadoModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="chamado-info">
                <div className="info-row">
                  <span className="info-label">ID:</span>
                  <span className="info-value">#{selectedChamado.id}</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Serviço:</span>
                  <span className="info-value">{selectedChamado.servico}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">
                    <div className="status-container">
                      {getStatusBadge(selectedChamado.status)}
                      {selectedChamado.assigned_by_admin && (
                        <span className="admin-assigned-badge">👑 Admin</span>
                      )}
                    </div>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">
                    <div className="user-info-modal">
                      <div className="user-avatar">{selectedChamado.cliente.avatar}</div>
                      <span>{selectedChamado.cliente.nome}</span>
                    </div>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Técnico:</span>
                  <span className="info-value">
                    <div className="user-info-modal">
                      <div className="user-avatar">{selectedChamado.tecnico.avatar}</div>
                      <span>{selectedChamado.tecnico.nome}</span>
                    </div>
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Última atualização:</span>
                  <span className="info-value">{selectedChamado.atualizado}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    closeChamadoModal()
                    navigate(`/admin-ticket/${selectedChamado.id}`)
                  }}
                >
                  ✏️ Editar Chamado
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => {
                    closeChamadoModal()
                    // Aqui você pode adicionar lógica para visualizar histórico
                  }}
                >
                  📋 Ver Histórico
                </button>
                <button 
                  className="action-btn info"
                  onClick={() => {
                    closeChamadoModal()
                    // Aqui você pode adicionar lógica para acompanhar progresso
                  }}
                >
                  📊 Acompanhar Progresso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de Lista de Técnicos
function TecnicosList() {
  const { token } = useAuth()
  const { showSuccess: showSuccessToast, showError: showErrorToast } = useToast()
  const navigate = useNavigate()
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTecnicos()
  }, [])

  const fetchTecnicos = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const res = await fetch('http://127.0.0.1:8000/tech/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Erro ao buscar técnicos')
      }

      const data = await res.json()
      console.log('👥 Técnicos recebidos pela API:', data)
      
      const formattedTecnicos = data.map((tecnico: any) => ({
        id: tecnico.id,
        nome: tecnico.full_name || tecnico.username,
        email: tecnico.email,
        avatar: (tecnico.full_name || tecnico.username).split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        disponibilidade: tecnico.availability ? tecnico.availability.split(',').slice(0, 4) : ['08:00', '09:00', '10:00', '11:00'],
        is_approved: tecnico.is_approved,
        is_active: tecnico.is_active
      }))
      
      setTecnicos(formattedTecnicos)
    } catch (error) {
      console.error('Erro ao buscar técnicos:', error)
      // Fallback para dados mockados em caso de erro
      setTecnicos([
        {
          id: 1,
          nome: 'Carlos Silva',
          email: 'carlos.silva@test.com',
          avatar: 'CS',
          disponibilidade: ['08:00', '09:00', '10:00', '11:00', '+4']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleApproveTechnician = async (technicianId: number) => {
    try {
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const res = await fetch(`http://127.0.0.1:8000/admin/technicians/${technicianId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(handleApiError({ ...errorData, status: res.status }))
      }

      showSuccessToast('Técnico aprovado com sucesso!')
      fetchTecnicos() // Recarregar lista
    } catch (error) {
      console.error('Erro ao aprovar técnico:', error)
      showErrorToast(handleApiError(error))
    }
  }

  return (
    <div className="tecnicos-container">
      <div className="page-header">
        <h1 className="page-title">Técnicos</h1>
        <button className="new-btn">+ Novo</button>
      </div>
      
      <div className="tecnicos-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando técnicos...</p>
          </div>
        ) : (
          tecnicos.map((tecnico, index) => (
            <div 
              key={index} 
              className="table-row"
              onClick={() => navigate(`/admin-technician/${tecnico.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="table-cell">
                <div className="user-info">
                  <div className="user-avatar">{tecnico.avatar}</div>
                  <span>{tecnico.nome}</span>
                </div>
              </div>
              <div className="table-cell">{tecnico.email}</div>
              <div className="table-cell">
                {tecnico.is_approved ? (
                  <span className="status-badge approved">✅ Aprovado</span>
                ) : (
                  <span className="status-badge pending">⏳ Pendente</span>
                )}
              </div>
              <div className="table-cell">
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!tecnico.is_approved && (
                    <button 
                      className="approve-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Aprovar técnico ${tecnico.nome}?`)) {
                          handleApproveTechnician(tecnico.id)
                        }
                      }}
                      title="Aprovar técnico"
                    >
                      ✓ Aprovar
                    </button>
                  )}
                  <button 
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/admin-technician/${tecnico.id}`)
                    }}
                    title="Ver detalhes"
                  >
                    👁️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Interfaces para tipagem
interface Ticket {
  id: number
  title: string
  description: string
  created_at: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  problem_type?: string
  status?: string
  assigned_technician?: {
    id: number
    full_name: string
  }
}

interface Technician {
  id: number
  full_name: string
  specialty?: string[]
}

// Componente para Chamados Abertos
function ChamadosAbertosList() {
  const { token } = useAuth()
  const { showSuccess: showSuccessToast, showError: showErrorToast } = useToast()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedTicketForProgress, setSelectedTicketForProgress] = useState<Ticket | null>(null)
  const [ticketHistory, setTicketHistory] = useState<any[]>([])
  const [ticketComments, setTicketComments] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTicketForEdit, setSelectedTicketForEdit] = useState<Ticket | null>(null)
  const [editingTicket, setEditingTicket] = useState(false)

  useEffect(() => {
    fetchOpenTickets()
    fetchTechnicians()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchTerm, statusFilter])

  const filterTickets = () => {
    let filtered = tickets

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toString().includes(searchTerm)
      )
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(ticket => {
        if (statusFilter === 'aberto') return !ticket.assigned_technician
        if (statusFilter === 'atribuido') return ticket.assigned_technician
        return true
      })
    }

    setFilteredTickets(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('todos')
  }

  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicketForModal(ticket)
    setShowTicketModal(true)
  }

  const closeTicketModal = () => {
    setSelectedTicketForModal(null)
    setShowTicketModal(false)
  }

  const openProgressModal = async (ticket: Ticket) => {
    console.log('🔍 Abrindo modal de progresso para ticket:', ticket)
    setSelectedTicketForProgress(ticket)
    setShowProgressModal(true)
    setLoadingHistory(true)
    
    try {
      // Buscar histórico e comentários do ticket
      if (token) {
        try {
          const historyResponse = await getTicketHistory(token, ticket.id)
          setTicketHistory(historyResponse.data || [])
        } catch (error) {
          console.log('⚠️ Erro ao buscar histórico, usando dados padrão:', error)
          // Se não houver histórico na API, criar histórico básico
          setTicketHistory([{
            id: 1,
            action: 'created',
            description: `Chamado criado: ${ticket.description}`,
            timestamp: ticket.created_at,
            user_name: 'Usuário'
          }])
        }
        
        try {
          const commentsResponse = await getTicketComments(token, ticket.id)
          setTicketComments(commentsResponse.data || [])
        } catch (error) {
          console.log('⚠️ Erro ao buscar comentários:', error)
          setTicketComments([])
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do ticket:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const closeProgressModal = () => {
    setSelectedTicketForProgress(null)
    setShowProgressModal(false)
    setTicketHistory([])
    setTicketComments([])
  }

  const fetchOpenTickets = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch('http://127.0.0.1:8000/admin/tickets?status=open', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Chamados abertos recebidos:', data)
        
        // Garantir que os tickets tenham a estrutura correta
        const formattedTickets: Ticket[] = data.map((ticket: any) => {
          // Verificar se tem técnico atribuído - considerar tanto assigned_technician_id quanto assigned_technician
          const hasTechnicianId = ticket.assigned_technician_id !== null && 
                                  ticket.assigned_technician_id !== undefined;
          const hasTechnicianObject = ticket.assigned_technician && 
                                      (ticket.assigned_technician.id || ticket.assigned_technician.full_name);
          
          return {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            created_at: ticket.created_at,
            priority: ticket.priority || 'medium',
            problem_type: ticket.problem_type || ticket.category || '',
            status: ticket.status || 'open',
            // Se assigned_technician existe e tem dados válidos, usar ele
            // Se não, mas assigned_technician_id existe, considerar como atribuído (mas sem detalhes)
            // Caso contrário, undefined (não atribuído - pode atribuir)
            assigned_technician: hasTechnicianObject
              ? {
                  id: ticket.assigned_technician.id || ticket.assigned_technician_id,
                  full_name: ticket.assigned_technician.full_name || ticket.assigned_technician.name || 'Técnico'
                }
              : (hasTechnicianId
                ? { 
                    id: ticket.assigned_technician_id, 
                    full_name: 'Técnico atribuído' 
                  }
                : undefined)
          };
        })
        
        console.log('📋 Tickets formatados - Quantidade:', formattedTickets.length)
        formattedTickets.forEach((ticket, index) => {
          console.log(`  Ticket ${index + 1} (ID: ${ticket.id}):`, {
            title: ticket.title,
            hasTechnician: !!ticket.assigned_technician,
            technician: ticket.assigned_technician
          })
        })
        setTickets(formattedTickets)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro ao buscar chamados abertos:', response.status)
        showErrorToast(handleApiError({ ...errorData, status: response.status }))
      }
    } catch (error) {
      console.error('Erro ao buscar chamados abertos:', error)
      showErrorToast(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const fetchTechnicians = async () => {
    try {
      console.log('🔍 Buscando técnicos...')
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch('http://127.0.0.1:8000/tech/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('👥 Técnicos recebidos:', data)
        setTechnicians(data)
      } else {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', response.status, errorText)
        // Fallback para técnicos de teste se a API falhar
        const testTechs = [
          { id: 1, full_name: 'Carlos Silva', specialty: ['Rede', 'Hardware'] },
          { id: 2, full_name: 'Ana Santos', specialty: ['Software', 'Sistema'] }
        ]
        console.log('🔄 Usando técnicos de teste:', testTechs)
        setTechnicians(testTechs)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar técnicos:', error)
      // Fallback para técnicos de teste se houver erro de conexão
      const testTechs = [
        { id: 1, full_name: 'Carlos Silva', specialty: ['Rede', 'Hardware'] },
        { id: 2, full_name: 'Ana Santos', specialty: ['Software', 'Sistema'] }
      ]
      console.log('🔄 Usando técnicos de teste (erro de conexão):', testTechs)
      setTechnicians(testTechs)
    }
  }

  const handleAssignTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowAssignModal(true)
  }

  const assignToTechnician = async (technicianId: number) => {
    if (!selectedTicket) {
      console.error('❌ Nenhum chamado selecionado')
      return
    }
    
    const isReassigning = !!selectedTicket.assigned_technician
    const actionText = isReassigning ? 'Reatribuindo' : 'Atribuindo'
    
    console.log(`🔄 ${actionText} chamado:`, selectedTicket.id, 'para técnico:', technicianId)
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/tickets/${selectedTicket.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ technician_id: technicianId })
      })

      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Chamado ${isReassigning ? 'reatribuído' : 'atribuído'} com sucesso:`, result)
        
        setShowAssignModal(false)
        setSelectedTicket(null)
        fetchOpenTickets() // Recarregar a lista
        
        // Criar notificação para o técnico (localmente se a API não existir)
        const technician = technicians.find(t => t.id === technicianId)
        if (technician) {
          createLocalNotification({
            title: isReassigning ? 'Chamado Reatribuído' : 'Novo Chamado Atribuído',
            message: `O chamado "${selectedTicket.title}" foi ${isReassigning ? 'reatribuído' : 'atribuído'} a você.`,
            type: 'ticket_assigned',
            ticket_id: selectedTicket.id,
            link: `/tech-dashboard?ticket=${selectedTicket.id}`
          })
        }
        
        showSuccessToast(`Chamado ${isReassigning ? 'reatribuído' : 'atribuído'} com sucesso! O técnico receberá uma notificação.`)
      } else {
        const errorData = await response.text()
        console.error('❌ Erro na resposta:', response.status, errorData)
        showErrorToast(handleApiError({ detail: errorData, status: response.status }))
      }
    } catch (error) {
      console.error(`❌ Erro ao ${isReassigning ? 'reatribuir' : 'atribuir'} chamado:`, error)
      showErrorToast(handleApiError(error))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  if (loading) {
    return (
      <div className="chamados-abertos-container">
        <LoadingSpinner size="large" message="Carregando chamados abertos..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="chamados-abertos-container">
      <div className="page-header">
        <h1 className="page-title">Chamados Abertos</h1>
        <p className="page-subtitle">Gerencie e atribua chamados aos técnicos</p>
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
        <div className="filters-header">
          <h3 className="filters-title">Filtros</h3>
        </div>
        <div className="filters-content">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por título, descrição ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="aberto">Abertos</option>
            <option value="atribuido">Atribuídos</option>
          </select>
          <button
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Seção de Chamados Abertos */}
      <div className="tickets-section">
        <div className="section-header">
          <div className="section-header-content">
            <h2 className="section-header-title">Chamados em Aberto</h2>
          </div>
        </div>

        <div className="tickets-grid">
          {filteredTickets.length === 0 ? (
            <div className="no-tickets">
              <p>
                {searchTerm || statusFilter !== 'todos' 
                  ? 'Nenhum chamado encontrado com os filtros aplicados' 
                  : 'Nenhum chamado aberto no momento'
                }
              </p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="ticket-card"
                onClick={() => openTicketModal(ticket)}
              >
                <div className="ticket-header">
                  <div className="ticket-id">#{String(ticket.id).padStart(5, '0')}</div>
                  <div className="ticket-actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        openTicketModal(ticket)
                      }}
                      title="Ver detalhes"
                    >
                      ✏️
                    </button>
                    {(!ticket.assigned_technician || !ticket.assigned_technician.id) && (
                      <button 
                        className="start-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssignTicket(ticket)
                        }}
                        title="Atribuir técnico a este chamado"
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      >
                        👤 Atribuir
                      </button>
                    )}
                  </div>
                </div>

                <div className="ticket-content">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-description">{ticket.description}</p>
                  <div className="ticket-meta">
                    <span className="ticket-date">{formatDate(ticket.created_at)}</span>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="assignee">
                    {ticket.assigned_technician ? (
                      <div className="tech-info">
                        <div className="tech-avatar">
                          {getInitials(ticket.assigned_technician.full_name)}
                        </div>
                        <span className="tech-name">{ticket.assigned_technician.full_name}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <span className="no-assignee" style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Não atribuído</span>
                        <button 
                          className="start-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAssignTicket(ticket)
                          }}
                          style={{ 
                            width: '100%', 
                            padding: '8px', 
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                          title="Atribuir técnico a este chamado"
                        >
                          👤 Atribuir Técnico
                        </button>
                      </div>
                    )}
                  </div>
                  {ticket.assigned_technician && (
                    <div className="status-indicator aberto">
                      <span className="status-icon">❓</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Ticket */}
      {showTicketModal && selectedTicketForModal && (
        <div className="ticket-modal-overlay">
          <div className="ticket-modal">
            <div className="ticket-modal-header">
              <button 
                className="ticket-modal-close"
                onClick={closeTicketModal}
              >
                ✕
              </button>
              <h1 className="ticket-modal-title">{selectedTicketForModal.title}</h1>
              <p className="ticket-modal-subtitle">
                Chamado #{String(selectedTicketForModal.id).padStart(5, '0')} • {formatDate(selectedTicketForModal.created_at)}
              </p>
            </div>
            
            <div className="ticket-modal-content">
              <div className="ticket-details-grid">
                <div className="ticket-info-section">
                  <h3>Informações do Chamado</h3>
                  <div className="ticket-description">
                    {selectedTicketForModal.description}
                  </div>
                  <div className="ticket-meta-info">
                    <div className="meta-item">
                      <div className="meta-label">ID do Chamado</div>
                      <div className="meta-value">#{String(selectedTicketForModal.id).padStart(5, '0')}</div>
                    </div>
                    <div className="meta-item">
                      <div className="meta-label">Data de Criação</div>
                      <div className="meta-value">{formatDate(selectedTicketForModal.created_at)}</div>
                    </div>
                    <div className="meta-item">
                      <div className="meta-label">Status</div>
                      <div className="meta-value">
                        {selectedTicketForModal.assigned_technician ? 'Atribuído' : 'Aberto'}
                      </div>
                    </div>
                    <div className="meta-item">
                      <div className="meta-label">Técnico</div>
                      <div className="meta-value">
                        {selectedTicketForModal.assigned_technician 
                          ? selectedTicketForModal.assigned_technician.full_name 
                          : 'Não atribuído'
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ticket-actions-section">
                  <h3>Ações</h3>
                  <div className="action-buttons">
                    {/* Botão de Atribuir Técnico - sempre visível */}
                    <button 
                      className="action-btn primary"
                      onClick={() => {
                        closeTicketModal()
                        handleAssignTicket(selectedTicketForModal)
                      }}
                      title={selectedTicketForModal.assigned_technician 
                        ? "Alterar técnico atribuído" 
                        : "Atribuir técnico a este chamado"}
                    >
                      {selectedTicketForModal.assigned_technician 
                        ? "👤 Alterar Técnico" 
                        : "👤 Atribuir Técnico"}
                    </button>
                    
                    {/* Botão de Acompanhar Progresso - sempre visível */}
                    <button 
                      className="action-btn info"
                      onClick={() => {
                        console.log('🖱️ Botão Acompanhar Progresso clicado!')
                        console.log('📋 Ticket selecionado:', selectedTicketForModal)
                        closeTicketModal()
                        openProgressModal(selectedTicketForModal)
                      }}
                    >
                      📊 Acompanhar Progresso
                    </button>
                    
                    <button 
                      className="action-btn secondary"
                      onClick={() => {
                        setSelectedTicketForEdit(selectedTicketForModal)
                        setShowEditModal(true)
                      }}
                    >
                      ✏️ Editar Chamado
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => {
                        closeTicketModal()
                        // Aqui você pode adicionar lógica para visualizar histórico
                      }}
                    >
                      📋 Ver Histórico
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atribuição */}
      {showAssignModal && (
        <div className="assign-modal-overlay">
          <div className="assign-modal">
            <div className="modal-header">
              <h3>{selectedTicket?.assigned_technician ? '👑 Reatribuir Chamado' : '👑 Atribuir Chamado'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <p><strong>Chamado:</strong> {selectedTicket?.title}</p>
              <p><strong>Descrição:</strong> {selectedTicket?.description}</p>
              {selectedTicket?.assigned_technician && (
                <p style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  ⚠️ Técnico atual: {selectedTicket.assigned_technician.full_name}
                </p>
              )}
              
              <div className="technicians-list">
                <h4>👥 {selectedTicket?.assigned_technician ? 'Selecione um novo técnico:' : 'Selecione um técnico:'}</h4>
                
                {/* Debug info */}
                <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px', fontSize: '0.8rem' }}>
                  <strong>Debug:</strong> Chamado ID: {selectedTicket?.id} | Técnicos: {technicians.length}
                </div>
                
                {technicians.length === 0 ? (
                  <div className="no-technicians">
                    <p>Nenhum técnico encontrado. Verifique se há técnicos cadastrados.</p>
                    <button 
                      className="test-btn"
                      onClick={() => {
                        // Técnico de teste para debug
                        const testTech = { id: 1, full_name: 'Técnico Teste', specialty: ['Rede', 'Hardware'] }
                        setTechnicians([testTech])
                      }}
                    >
                      Usar Técnico de Teste
                    </button>
                  </div>
                ) : (
                  technicians.map(tech => {
                    const isCurrentTechnician = selectedTicket?.assigned_technician?.id === tech.id
                    return (
                      <div 
                        key={tech.id} 
                        className="technician-option"
                        onClick={() => {
                          if (!isCurrentTechnician) {
                            console.log('🖱️ Clicou no técnico:', tech)
                            assignToTechnician(tech.id)
                          }
                        }}
                        style={{
                          opacity: isCurrentTechnician ? 0.6 : 1,
                          cursor: isCurrentTechnician ? 'not-allowed' : 'pointer',
                          border: isCurrentTechnician ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                          backgroundColor: isCurrentTechnician ? '#fef3c7' : 'transparent'
                        }}
                        title={isCurrentTechnician ? 'Técnico atualmente atribuído' : 'Clique para atribuir este técnico'}
                      >
                        <div className="tech-avatar">
                          {getInitials(tech.full_name)}
                        </div>
                        <div className="tech-info">
                          <span className="tech-name">
                            {tech.full_name}
                            {isCurrentTechnician && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>✓ Atual</span>}
                          </span>
                          <span className="tech-specialty">{tech.specialty?.join(', ')}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Acompanhar Progresso */}
      {showProgressModal && selectedTicketForProgress && (
        <div className="modal-overlay" onClick={closeProgressModal}>
          <div className="modal-content progress-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Acompanhar Progresso</h2>
              <button className="close-btn" onClick={closeProgressModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="progress-header">
                <h3>{selectedTicketForProgress.title}</h3>
                <div className="ticket-status-info">
                  <span className="ticket-id">#{String(selectedTicketForProgress.id).padStart(5, '0')}</span>
                  <span className="current-status">
                    {selectedTicketForProgress.assigned_technician ? 'Atribuído' : 'Aberto'}
                  </span>
                </div>
              </div>

              <div className="progress-timeline">
                <h4>📋 Histórico do Chamado</h4>
                
                {loadingHistory ? (
                  <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
                    <LoadingSpinner size="medium" message="Carregando histórico..." fullScreen={false} />
                  </div>
                ) : (
                  <>
                    {/* Se não está atribuído, mostrar apenas histórico do usuário */}
                    {!selectedTicketForProgress.assigned_technician ? (
                      <>
                        <div className="timeline-item">
                          <div className="timeline-marker created"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-title">Chamado Criado</span>
                              <span className="timeline-date">{formatDate(selectedTicketForProgress.created_at)}</span>
                            </div>
                            <div className="timeline-description">
                              <p><strong>Descrição:</strong> {selectedTicketForProgress.description}</p>
                              <p><strong>Solicitado por:</strong> Usuário</p>
                            </div>
                          </div>
                        </div>
                        <div className="timeline-item current">
                          <div className="timeline-marker current"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-title">Status Atual</span>
                              <span className="timeline-date">Agora</span>
                            </div>
                            <div className="timeline-description">
                              <p><strong>Status:</strong> Aguardando Atribuição</p>
                              <p><strong>Atribuição:</strong> Não atribuído</p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Histórico completo quando atribuído */}
                        <div className="timeline-item">
                          <div className="timeline-marker created"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-title">Chamado Criado</span>
                              <span className="timeline-date">{formatDate(selectedTicketForProgress.created_at)}</span>
                            </div>
                            <div className="timeline-description">
                              <p><strong>Descrição:</strong> {selectedTicketForProgress.description}</p>
                              <p><strong>Solicitado por:</strong> Usuário</p>
                            </div>
                          </div>
                        </div>

                        <div className="timeline-item">
                          <div className="timeline-marker assigned"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-title">Chamado Atribuído</span>
                              <span className="timeline-date">{formatDate(selectedTicketForProgress.created_at)}</span>
                            </div>
                            <div className="timeline-description">
                              <p><strong>Atribuído para:</strong> {selectedTicketForProgress.assigned_technician.full_name}</p>
                              <p><strong>Atribuído por:</strong> Administrador</p>
                              <div className="technician-info">
                                <div className="tech-avatar-small">
                                  {getInitials(selectedTicketForProgress.assigned_technician.full_name)}
                                </div>
                                <span>{selectedTicketForProgress.assigned_technician.full_name}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mostrar histórico da API se disponível */}
                        {ticketHistory.length > 0 && ticketHistory.map((item: any, index: number) => (
                          <div key={item.id || index} className="timeline-item">
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <span className="timeline-title">{item.action || 'Atualização'}</span>
                                <span className="timeline-date">{formatDate(item.timestamp || item.created_at)}</span>
                              </div>
                              <div className="timeline-description">
                                <p>{item.description || item.comment}</p>
                                {item.user_name && <p><strong>Por:</strong> {item.user_name}</p>}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Mostrar comentários se disponíveis */}
                        {ticketComments.length > 0 && (
                          <>
                            <h5 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>💬 Comentários</h5>
                            {ticketComments.map((comment: any, index: number) => (
                              <div key={comment.id || index} className="timeline-item">
                                <div className="timeline-marker"></div>
                                <div className="timeline-content">
                                  <div className="timeline-header">
                                    <span className="timeline-title">{comment.author || 'Usuário'}</span>
                                    <span className="timeline-date">{formatDate(comment.created_at || comment.timestamp)}</span>
                                  </div>
                                  <div className="timeline-description">
                                    <p>{comment.text || comment.comment}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        <div className="timeline-item current">
                          <div className="timeline-marker current"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-title">Status Atual</span>
                              <span className="timeline-date">Agora</span>
                            </div>
                            <div className="timeline-description">
                              <p><strong>Status:</strong> Em Andamento</p>
                              <p><strong>Técnico Responsável:</strong> {selectedTicketForProgress.assigned_technician.full_name}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="progress-summary">
                <h4>📈 Resumo</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Tempo Decorrido</span>
                    <span className="summary-value">{Math.ceil((Date.now() - new Date(selectedTicketForProgress.created_at).getTime()) / (1000 * 60 * 60))} horas</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Status</span>
                    <span className="summary-value">{selectedTicketForProgress.assigned_technician ? 'Em Andamento' : 'Aguardando'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Prioridade</span>
                    <span className="summary-value">Média</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Chamado */}
      {showEditModal && selectedTicketForEdit && (
        <EditTicketModal
          ticket={selectedTicketForEdit}
          onClose={() => {
            setShowEditModal(false)
            setSelectedTicketForEdit(null)
          }}
          onSave={async (updatedData) => {
            try {
              setEditingTicket(true)
              if (!token) {
                throw new Error('Token não encontrado')
              }

              console.log('💾 Salvando alterações do ticket:', selectedTicketForEdit.id, updatedData)
              await updateTicket(token, selectedTicketForEdit.id, updatedData)
              
              // Atualizar o ticket na lista
              setTickets(prevTickets => 
                prevTickets.map(t => 
                  t.id === selectedTicketForEdit.id 
                    ? { ...t, ...updatedData }
                    : t
                )
              )

              // Atualizar o ticket no modal se estiver aberto
              if (selectedTicketForModal?.id === selectedTicketForEdit.id) {
                setSelectedTicketForModal({
                  ...selectedTicketForModal,
                  ...updatedData
                })
              }

              setShowEditModal(false)
              setSelectedTicketForEdit(null)
              showSuccessToast('Chamado atualizado com sucesso!')
              
              // Recarregar a lista para garantir dados atualizados
              fetchOpenTickets()
            } catch (error: any) {
              console.error('❌ Erro ao atualizar chamado:', error)
              showErrorToast(handleApiError(error))
            } finally {
              setEditingTicket(false)
            }
          }}
          isSaving={editingTicket}
        />
      )}
    </div>
  )
}

// Componentes placeholder para outras seções
function ClientesList() {
  const [servidores, setServidores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServidores()
  }, [])

  const fetchServidores = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:8000/servidores/todos')
      
      if (response.ok) {
        const data = await response.json()
        setServidores(data)
      } else {
        console.error('Erro ao buscar servidores')
      }
    } catch (error) {
      console.error('Erro ao buscar servidores:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="clientes-container">
      <div className="page-header">
        <h1 className="page-title">Servidores</h1>
      </div>
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando servidores...</p>
        </div>
      ) : (
        <div className="tecnicos-table-container">
          <div className="table-header">
            <div className="table-cell">Nome</div>
            <div className="table-cell">Email</div>
            <div className="table-cell">Status</div>
          </div>
          {servidores.map((servidor: any, index: number) => (
            <div key={index} className="table-row">
              <div className="table-cell">
                <div className="user-info">
                  <div className="user-avatar">
                    {(servidor.full_name || servidor.username)
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span>{servidor.full_name || servidor.username}</span>
                </div>
              </div>
              <div className="table-cell">{servidor.email}</div>
              <div className="table-cell">
                {servidor.is_active ? (
                  <span className="status-badge approved">✅ Ativo</span>
                ) : (
                  <span className="status-badge pending">⏸️ Inativo</span>
                )}
              </div>
            </div>
          ))}
          {servidores.length === 0 && (
            <div className="empty-state">
              <p>Nenhum servidor encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ServicosList() {
  return (
    <div className="servicos-container">
      <h1 className="page-title">Serviços</h1>
      <p>Lista de serviços em desenvolvimento...</p>
    </div>
  )
}
