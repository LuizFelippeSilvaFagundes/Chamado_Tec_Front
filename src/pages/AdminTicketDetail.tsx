import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './AdminTicketDetail.css'

export default function AdminTicketDetail() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [ticket, setTicket] = useState<any>(null)
  const [ticketLoading, setTicketLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchTicket()
    }
  }, [id])

  const fetchTicket = async () => {
    try {
      setTicketLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const res = await fetch(`http://127.0.0.1:8000/tickets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Erro ao buscar chamado')
      }

      const data = await res.json()
      console.log('📋 Chamado recebido pela API:', data)
      
      setTicket({
        id: data.id.toString().padStart(5, '0'),
        titulo: data.title,
        descricao: data.description,
        categoria: data.problem_type,
        status: getStatusLabel(data.status),
        criado_em: formatDateTime(data.created_at),
        atualizado_em: formatDateTime(data.updated_at),
        cliente: {
          nome: data.user_name || 'Usuário',
          avatar: (data.user_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          email: data.user_email || 'usuario@empresa.com'
        },
        tecnico_responsavel: {
          nome: data.technician_name || 'Não atribuído',
          avatar: (data.technician_name || 'N').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          email: data.technician_email || 'tecnico@empresa.com'
        }
      })
    } catch (error) {
      console.error('Erro ao buscar chamado:', error)
      // Fallback para dados mockados
      setTicket({
        id: '00004',
        titulo: 'Backup não está funcionando',
        descricao: 'O sistema de backup automático parou de funcionar. Última execução bem-sucedida foi há uma semana.',
        categoria: 'Recuperação de Dados',
        status: 'Aberto',
        criado_em: '12/04/25 09:12',
        atualizado_em: '12/04/25 15:20',
        cliente: {
          nome: 'André Costa',
          avatar: 'AC',
          email: 'andre.costa@empresa.com'
        },
        tecnico_responsavel: {
          nome: 'Carlos Silva',
          avatar: 'CS',
          email: 'carlos.silva@test.com'
        }
      })
    } finally {
      setTicketLoading(false)
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

  // Lista de técnicos disponíveis
  const tecnicos = [
    { id: 1, nome: 'Carlos Silva', avatar: 'CS', email: 'carlos.silva@test.com' },
    { id: 2, nome: 'Ana Oliveira', avatar: 'AO', email: 'ana.oliveira@test.com' },
    { id: 3, nome: 'Cíntia Lúcia', avatar: 'CL', email: 'cintia.lucia@test.com' },
    { id: 4, nome: 'Marcos Alves', avatar: 'MA', email: 'marcos.alves@test.com' }
  ]

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true)
      
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const res = await fetch(`http://127.0.0.1:8000/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          technician_id: selectedTechnician || null
        })
      })

      if (!res.ok) {
        throw new Error('Erro ao atualizar status do chamado')
      }

      alert(`Chamado ${newStatus === 'in-progress' ? 'enviado para atendimento' : 'encerrado'} com sucesso!`)
      navigate('/admin-dashboard')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do chamado')
    } finally {
      setLoading(false)
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
    <div className="admin-ticket-detail">
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
            className="nav-item"
            onClick={() => navigate('/admin-dashboard')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Chamados</span>
          </button>
          
          <button 
            className="nav-item"
            onClick={() => navigate('/admin-dashboard?tab=tecnicos')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Técnicos</span>
          </button>
          
          <button 
            className="nav-item"
            onClick={() => navigate('/admin-dashboard?tab=clientes')}
          >
            <span className="nav-icon">💼</span>
            <span className="nav-text">Clientes</span>
          </button>
          
          <button 
            className="nav-item"
            onClick={() => navigate('/admin-dashboard?tab=servicos')}
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
        <div className="ticket-detail-container">
          {/* Header */}
          <div className="detail-header">
            <button 
              className="back-btn"
              onClick={() => navigate('/admin-dashboard')}
            >
              ← Voltar
            </button>
            <h1 className="page-title">Chamado detalhado</h1>
            <div className="status-actions">
              <button 
                className="status-btn em-atendimento"
                onClick={() => handleStatusChange('in-progress')}
                disabled={loading}
              >
                🕐 Em atendimento
              </button>
              <button 
                className="status-btn encerrado"
                onClick={() => handleStatusChange('resolved')}
                disabled={loading}
              >
                ✅ Encerrado
              </button>
            </div>
          </div>

          {/* Loading */}
          {ticketLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando chamado...</p>
            </div>
          ) : ticket ? (
            <>
              {/* Seleção de Técnico */}
              {ticket.status === 'Aberto' && (
            <div className="technician-selection">
              <label htmlFor="technician-select">Selecionar Técnico Responsável:</label>
              <select 
                id="technician-select"
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="technician-select"
              >
                <option value="">Selecione um técnico</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome} - {tecnico.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Card Principal do Chamado */}
          <div className="ticket-card">
            <div className="ticket-header">
              <div className="ticket-id">ID: {ticket.id}</div>
              {getStatusBadge(ticket.status)}
            </div>
            
            <div className="ticket-content">
              <h2 className="ticket-title">{ticket.titulo}</h2>
              
              <div className="ticket-description">
                <h3>Descrição</h3>
                <p>{ticket.descricao}</p>
              </div>
              
              <div className="ticket-category">
                <h3>Categoria</h3>
                <span className="category-badge">{ticket.categoria}</span>
              </div>
              
              <div className="ticket-dates">
                <div className="date-item">
                  <strong>Criado em:</strong> {ticket.criado_em}
                </div>
                <div className="date-item">
                  <strong>Atualizado em:</strong> {ticket.atualizado_em}
                </div>
              </div>
              
              <div className="ticket-client">
                <h3>Cliente</h3>
                <div className="user-info">
                  <div className="user-avatar">{ticket.cliente.avatar}</div>
                  <div className="user-details">
                    <div className="user-name">{ticket.cliente.nome}</div>
                    <div className="user-email">{ticket.cliente.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card do Técnico Responsável */}
          <div className="technician-card">
            <h3>Técnico responsável</h3>
            <div className="user-info">
              <div className="user-avatar">{ticket.tecnico_responsavel.avatar}</div>
              <div className="user-details">
                <div className="user-name">{ticket.tecnico_responsavel.nome}</div>
                <div className="user-email">{ticket.tecnico_responsavel.email}</div>
              </div>
            </div>
          </div>
            </>
          ) : (
            <div className="error-state">
              <p>Chamado não encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
