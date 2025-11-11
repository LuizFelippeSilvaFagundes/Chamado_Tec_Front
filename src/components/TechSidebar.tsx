import './TechSidebar.css'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationCenter from './NotificationCenter'

type ActiveSection = 
  | 'ticket-management'
  | 'assigned-tickets'
  | 'reports'
  | 'knowledge-base'

interface TechSidebarProps {
  activeSection: ActiveSection
  onSectionChange: (section: ActiveSection) => void
}

function TechSidebar({ activeSection, onSectionChange }: TechSidebarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  const menuItems = [
    {
      id: 'ticket-management' as ActiveSection,
      label: 'Gerenciar Chamados',
      icon: '📋',
      description: 'Chamados resolvidos por você'
    },
    {
      id: 'assigned-tickets' as ActiveSection,
      label: 'Meus Chamados',
      icon: '🎫',
      description: 'Chamados atribuídos pelo administrador'
    },
    {
      id: 'reports' as ActiveSection,
      label: 'Relatórios',
      icon: '📊',
      description: 'Dashboards e relatórios'
    },
    {
      id: 'knowledge-base' as ActiveSection,
      label: 'Base de Conhecimento',
      icon: '📚',
      description: 'Encontre soluções para problemas comuns'
    }
  ]

  return (
    <aside className="tech-sidebar">
      <div className="sidebar-header">
        <h3>🔧 Painel Técnico</h3>
        <p>Área restrita para técnicos</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
            title={item.description}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 1rem', justifyContent: 'center' }}>
          <NotificationCenter />
        </div>
        
        <div className="tech-info">
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="status-online">🟢 Online</span>
          </div>
          <div className="info-item">
            <span className="info-label">Chamados Ativos:</span>
            <span className="info-value">12</span>
          </div>
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Sair</span>
        </button>
      </div>
    </aside>
  )
}

export default TechSidebar
