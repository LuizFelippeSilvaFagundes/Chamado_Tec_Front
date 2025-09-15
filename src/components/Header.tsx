import { useState } from 'react'
import './Header.css'

interface HeaderProps {
  userName: string
  onLogout: () => void
}

function Header({ userName, onLogout }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">Águia Branca</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <div className="user-menu">
            <button 
              className="menu-toggle"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="user-avatar">👤</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showMenu && (
              <div className="menu-dropdown">
                <button className="menu-item" onClick={() => setShowMenu(false)}>
                  <span>👤</span> Perfil
                </button>
                <button className="menu-item logout" onClick={onLogout}>
                  <span>🚪</span> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
