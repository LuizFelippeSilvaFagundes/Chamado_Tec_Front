import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AvatarUpload from '../components/AvatarUpload'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('chamados-abertos')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Sincronizar avatar com o contexto
  useEffect(() => {
    if (user?.avatar_url) {
      setUserAvatarUrl(user.avatar_url)
    }
  }, [user?.avatar_url])

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

  const handleAvatarUpdate = (newAvatarUrl: string | null) => {
    setUserAvatarUrl(newAvatarUrl)
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
        </nav>

        {/* User Profile */}
        <div className="sidebar-user">
          <div className="user-profile">
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

      const res = await fetch('http://127.0.0.1:8000/admin/tecnicos', {
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
        throw new Error('Erro ao aprovar técnico')
      }

      alert('✅ Técnico aprovado com sucesso!')
      fetchTecnicos() // Recarregar lista
    } catch (error) {
      console.error('Erro ao aprovar técnico:', error)
      alert('❌ Erro ao aprovar técnico')
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

  const openProgressModal = (ticket: Ticket) => {
    console.log('🔍 Abrindo modal de progresso para ticket:', ticket)
    setSelectedTicketForProgress(ticket)
    setShowProgressModal(true)
    console.log('✅ Modal de progresso deve estar visível agora')
  }

  const closeProgressModal = () => {
    setSelectedTicketForProgress(null)
    setShowProgressModal(false)
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
        setTickets(data)
      } else {
        console.error('Erro ao buscar chamados abertos:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar chamados abertos:', error)
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

      const response = await fetch('http://127.0.0.1:8000/admin/tecnicos', {
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
    
    console.log('🔄 Atribuindo chamado:', selectedTicket.id, 'para técnico:', technicianId)
    
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
        console.log('✅ Chamado atribuído com sucesso:', result)
        
        setShowAssignModal(false)
        setSelectedTicket(null)
        fetchOpenTickets() // Recarregar a lista
        alert('✅ Chamado atribuído com sucesso! O técnico receberá uma notificação.')
      } else {
        const errorData = await response.text()
        console.error('❌ Erro na resposta:', response.status, errorData)
        alert(`Erro ao atribuir chamado: ${response.status} - ${errorData}`)
      }
    } catch (error) {
      console.error('❌ Erro ao atribuir chamado:', error)
      alert(`Erro de conexão: ${error}`)
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
        <div className="loading">Carregando chamados abertos...</div>
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
                    >
                      ✏️
                    </button>
                    {!ticket.assigned_technician && (
                      <button 
                        className="start-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssignTicket(ticket)
                        }}
                      >
                        🕒 Iniciar
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
                      <span className="no-assignee">Não atribuído</span>
                    )}
                  </div>
                  <div className="status-indicator aberto">
                    <span className="status-icon">❓</span>
                  </div>
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
                    {!selectedTicketForModal.assigned_technician ? (
                      <button 
                        className="action-btn primary"
                        onClick={() => {
                          closeTicketModal()
                          handleAssignTicket(selectedTicketForModal)
                        }}
                      >
                        🕒 Atribuir Técnico
                      </button>
                    ) : (
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
                    )}
                    <button 
                      className="action-btn secondary"
                      onClick={() => {
                        closeTicketModal()
                        // Aqui você pode adicionar lógica para editar o ticket
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
              <h3>👑 Atribuir Chamado</h3>
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
              
              <div className="technicians-list">
                <h4>👥 Selecione um técnico:</h4>
                
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
                  technicians.map(tech => (
                    <div 
                      key={tech.id} 
                      className="technician-option"
                      onClick={() => {
                        console.log('🖱️ Clicou no técnico:', tech)
                        assignToTechnician(tech.id)
                      }}
                    >
                      <div className="tech-avatar">
                        {getInitials(tech.full_name)}
                      </div>
                      <div className="tech-info">
                        <span className="tech-name">{tech.full_name}</span>
                        <span className="tech-specialty">{tech.specialty?.join(', ')}</span>
                      </div>
                    </div>
                  ))
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
                
                <div className="timeline-item">
                  <div className="timeline-marker created"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-title">Chamado Criado</span>
                      <span className="timeline-date">{formatDate(selectedTicketForProgress.created_at)}</span>
                    </div>
                    <div className="timeline-description">
                      <p><strong>Descrição:</strong> {selectedTicketForProgress.description}</p>
                      <p><strong>Solicitado por:</strong> Usuário do sistema</p>
                    </div>
                  </div>
                </div>

                {selectedTicketForProgress.assigned_technician && (
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
                )}

                <div className="timeline-item current">
                  <div className="timeline-marker current"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-title">Status Atual</span>
                      <span className="timeline-date">Agora</span>
                    </div>
                    <div className="timeline-description">
                      <p><strong>Status:</strong> {selectedTicketForProgress.assigned_technician ? 'Em Andamento' : 'Aguardando Atribuição'}</p>
                      {selectedTicketForProgress.assigned_technician && (
                        <p><strong>Técnico Responsável:</strong> {selectedTicketForProgress.assigned_technician.full_name}</p>
                      )}
                    </div>
                  </div>
                </div>
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
    </div>
  )
}

// Componentes placeholder para outras seções
function ClientesList() {
  return (
    <div className="clientes-container">
      <h1 className="page-title">Clientes</h1>
      <p>Lista de clientes em desenvolvimento...</p>
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
