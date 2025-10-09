import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AvatarUpload from './AvatarUpload'
import './Header.css'

interface HeaderProps {
  userName: string
  onLogout: () => void
}

function Header({ userName, onLogout }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(null)
  const [avatarKey, setAvatarKey] = useState(Date.now())

  const API_URL = 'http://127.0.0.1:8000'

  // Carregar avatar ao montar e quando user mudar
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url)
      setAvatarKey(Date.now())
    } else {
      setAvatarUrl(null)
    }
  }, [user])

  const handleAvatarUpdate = (newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl)
    setAvatarKey(Date.now()) // Força reload da imagem com novo timestamp
  }

  return (
    <>
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
                {avatarUrl ? (
                  <img 
                    key={avatarKey}
                    src={`${API_URL}${avatarUrl}?t=${avatarKey}`} 
                    alt="Avatar" 
                    className="user-avatar-img"
                  />
                ) : (
                  <span className="user-avatar">👤</span>
                )}
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showMenu && (
                <div className="menu-dropdown">
                  <button 
                    className="menu-item" 
                    onClick={() => {
                      setShowMenu(false)
                      setShowAvatarModal(true)
                    }}
                  >
                    <span>📸</span> Alterar Avatar
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

      {showAvatarModal && (
        <AvatarUpload 
          onClose={() => setShowAvatarModal(false)}
          onAvatarUpdate={handleAvatarUpdate}
        />
      )}
    </>
  )
}

export default Header
