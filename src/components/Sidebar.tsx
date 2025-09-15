import './Sidebar.css'

interface SidebarProps {
  activeSection: 'open-ticket' | 'my-tickets' | 'knowledge-base'
  onSectionChange: (section: 'open-ticket' | 'my-tickets' | 'knowledge-base') => void
}

function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'open-ticket' as const,
      label: 'Abrir Chamado',
      icon: '📝',
      description: 'Criar novo chamado'
    },
    {
      id: 'my-tickets' as const,
      label: 'Meus Chamados',
      icon: '📋',
      description: 'Visualizar e acompanhar'
    },
    {
      id: 'knowledge-base' as const,
      label: 'Base de Conhecimento',
      icon: '📚',
      description: 'Documentação e FAQs'
    }
  ]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-content">
              <span className="nav-label">{item.label}</span>
              <span className="nav-description">{item.description}</span>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
