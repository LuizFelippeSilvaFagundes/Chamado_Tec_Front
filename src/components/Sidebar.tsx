import './Sidebar.css'
import { useAuth } from '../contexts/AuthContext'

interface SidebarProps {
  activeSection: 'open-ticket' | 'my-tickets' | 'knowledge-base'
  onSectionChange: (section: 'open-ticket' | 'my-tickets' | 'knowledge-base') => void
}

function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth()

  const menuItems = [
    {
      id: 'my-tickets' as const,
      label: 'Meus chamados',
      icon: '📋'
    },
    {
      id: 'open-ticket' as const,
      label: 'Criar chamado',
      icon: '+',
      isButton: true
    }
  ]

  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return 'UC'
  }

  const getUserName = () => {
    return user?.full_name || 'Usuário Cliente'
  }

  const getUserEmail = () => {
    return user?.email || 'user.client@test.com'
  }

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <div className="logo-circle"></div>
          </div>
          <div className="logo-text">
            <h1>HelpDesk</h1>
            <span>CLIENTE</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${item.isButton ? 'nav-button' : ''} ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile */}
    
    </aside>
  )
}

export default Sidebar
