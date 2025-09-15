import './TechSidebar.css'
import { useAuth } from '../contexts/AuthContext'

type ActiveSection = 
  | 'assigned-tickets'
  | 'ticket-management'
  | 'chat'
  | 'equipment-history'
  | 'reports'
  | 'sla-monitoring'
  | 'approval'
  | 'tech-approval'

interface TechSidebarProps {
  activeSection: ActiveSection
  onSectionChange: (section: ActiveSection) => void
}

function TechSidebar({ activeSection, onSectionChange }: TechSidebarProps) {
  const { isAdmin } = useAuth()
  
  const menuItems = [
    {
      id: 'assigned-tickets' as ActiveSection,
      label: 'Chamados Atribuídos',
      icon: '🎫',
      description: 'Visualizar chamados atribuídos'
    },
    {
      id: 'ticket-management' as ActiveSection,
      label: 'Gerenciar Chamados',
      icon: '⚙️',
      description: 'Atualizar status e histórico'
    },
    {
      id: 'chat' as ActiveSection,
      label: 'Chat',
      icon: '💬',
      description: 'Chat integrado com usuários'
    },
    {
      id: 'equipment-history' as ActiveSection,
      label: 'Histórico Equipamentos',
      icon: '🖥️',
      description: 'Consultar histórico de equipamentos'
    },
    {
      id: 'reports' as ActiveSection,
      label: 'Relatórios',
      icon: '📊',
      description: 'Dashboards e relatórios'
    },
    {
      id: 'sla-monitoring' as ActiveSection,
      label: 'SLA & Produtividade',
      icon: '⏱️',
      description: 'Monitorar SLA e produtividade'
    },
    {
      id: 'approval' as ActiveSection,
      label: 'Aprovações',
      icon: '✅',
      description: 'Aprovar ou reatribuir chamados'
    },
    // Apenas para admins
    ...(isAdmin ? [{
      id: 'tech-approval' as ActiveSection,
      label: 'Aprovar Técnicos',
      icon: '👥',
      description: 'Aprovar cadastros de técnicos'
    }] : [])
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
      </div>
    </aside>
  )
}

export default TechSidebar
