import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('chamados')

  const renderContent = () => {
    switch (activeTab) {
      case 'chamados':
        return <ChamadosList />
      case 'tecnicos':
        return <TecnicosList />
      case 'clientes':
        return <ClientesList />
      case 'servicos':
        return <ServicosList />
      default:
        return <ChamadosList />
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

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <span>UA</span>
            </div>
            <div className="user-info">
              <div className="user-name">Usuário Adm</div>
              <div className="user-email">user.adm@test.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {renderContent()}
      </div>
    </div>
  )
}

// Componente de Lista de Chamados
function ChamadosList() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [chamados, setChamados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChamados()
  }, [])

  const fetchChamados = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

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
      
      const formattedChamados = data.map((ticket: any) => ({
        id: ticket.id.toString().padStart(5, '0'),
        titulo: ticket.title,
        servico: ticket.problem_type,
        cliente: { 
          nome: ticket.user_name || 'Usuário', 
          avatar: (ticket.user_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()
        },
        tecnico: { 
          nome: ticket.technician_name || 'Não atribuído', 
          avatar: (ticket.technician_name || 'N').split(' ').map((n: string) => n[0]).join('').toUpperCase()
        },
        status: getStatusLabel(ticket.status),
        atualizado: formatDateTime(ticket.updated_at)
      }))
      
      setChamados(formattedChamados)
    } catch (error) {
      console.error('Erro ao buscar chamados:', error)
      // Fallback para dados mockados em caso de erro
      setChamados([
        {
          id: '00003',
          titulo: 'Rede lenta',
          servico: 'Instalação de Rede',
          cliente: { nome: 'André Costa', avatar: 'AC' },
          tecnico: { nome: 'Carlos Silva', avatar: 'CS' },
          status: 'Aberto',
          atualizado: '13/04/25 20:56'
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
      <h1 className="page-title">Chamados</h1>
      
      <div className="chamados-table-container">
        <div className="table-header">
          <div className="header-cell">Atualizado em</div>
          <div className="header-cell">Id</div>
          <div className="header-cell">Título e Serviço</div>
          <div className="header-cell">Cliente</div>
          <div className="header-cell">Técnico</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Ações</div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando chamados...</p>
          </div>
        ) : (
          chamados.map((chamado) => (
          <div 
            key={chamado.id} 
            className="table-row"
            onClick={() => navigate(`/admin-ticket/${chamado.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="table-cell">{chamado.atualizado}</div>
            <div className="table-cell">{chamado.id}</div>
            <div className="table-cell">
              <div className="titulo-servico">
                <div className="titulo">{chamado.titulo}</div>
                <div className="servico">{chamado.servico}</div>
              </div>
            </div>
            <div className="table-cell">
              <div className="user-info">
                <div className="user-avatar">{chamado.cliente.avatar}</div>
                <span>{chamado.cliente.nome}</span>
              </div>
            </div>
            <div className="table-cell">
              <div className="user-info">
                <div className="user-avatar">{chamado.tecnico.avatar}</div>
                <span>{chamado.tecnico.nome}</span>
              </div>
            </div>
            <div className="table-cell">
              {getStatusBadge(chamado.status)}
            </div>
            <div className="table-cell">
              <button 
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/admin-ticket/${chamado.id}`)
                }}
              >
                ✏️
              </button>
            </div>
          </div>
          ))
        )}
      </div>
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

      const res = await fetch('http://127.0.0.1:8000/users?role=technician', {
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
        disponibilidade: tecnico.availability ? tecnico.availability.split(',').slice(0, 4) : ['08:00', '09:00', '10:00', '11:00']
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

  return (
    <div className="tecnicos-container">
      <div className="page-header">
        <h1 className="page-title">Técnicos</h1>
        <button className="new-btn">+ Novo</button>
      </div>
      
      <div className="tecnicos-table-container">
        <div className="table-header">
          <div className="header-cell">Nome</div>
          <div className="header-cell">E-mail</div>
          <div className="header-cell">Disponibilidade</div>
          <div className="header-cell">Ações</div>
        </div>

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
                <div className="disponibilidade">
                  {tecnico.disponibilidade.map((horario: string, i: number) => (
                    <span key={i} className="horario-badge">{horario}</span>
                  ))}
                </div>
              </div>
              <div className="table-cell">
                <button 
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/admin-technician/${tecnico.id}`)
                  }}
                >
                  ✏️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
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
