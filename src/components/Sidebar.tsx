import './Sidebar.css'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword, uploadAvatar } from '../api/api'

interface SidebarProps {
  activeSection: 'open-ticket' | 'my-tickets' | 'knowledge-base'
  onSectionChange: (section: 'open-ticket' | 'my-tickets' | 'knowledge-base') => void
}

function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user, logout, token } = useAuth()
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [currentPwdVisible, setCurrentPwdVisible] = useState(false)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

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

  // Fecha popover ao clicar fora
  useEffect(() => {
    function onClickOutside(ev: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(ev.target as Node)) {
        setShowAccountModal(false)
      }
    }
    if (showAccountModal) {
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showAccountModal])

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img src="/Logo_IconDark.svg" alt="HelpDesk" className="logo-img" />
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

      {/* User Profile on top area */}
      <div className="sidebar-user">
        <div className="user-profile">
          <button className="avatar-button" onClick={() => setShowAccountModal(true)}>
            <div className="user-avatar">{getUserInitials()}</div>
            <span className="user-short-name">{user?.full_name || 'Usuário'}</span>
          </button>
        </div>
      </div>

      {showAccountModal && (
        <div className="account-popover" ref={popoverRef}>
          <div className="account-popover-title">Opções</div>
          <button className="account-popover-item" onClick={() => { setShowAccountModal(false); setShowProfileModal(true) }}>
            <img className="item-icon-img" src="/src/assets/icons/circle-user.svg" alt="perfil" />
            <span>Perfil</span>
          </button>
          <button className="account-popover-item danger" onClick={() => { setShowAccountModal(false); logout(); }}>
            <img className="item-icon-img" src="/src/assets/icons/log-out.svg" alt="sair" />
            <span>Sair</span>
          </button>
        </div>
      )}

      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header">
              <h3>Perfil</h3>
              <button className="profile-close" onClick={() => setShowProfileModal(false)}>
                <img src="/src/assets/icons/x.svg" alt="fechar" />
              </button>
            </div>
            <div className="profile-avatar-row">
              <div className="profile-avatar-circle">{getUserInitials()}</div>
              <div className="profile-avatar-actions">
                <label className="upload-btn">
                  <img src="/src/assets/icons/upload.svg" alt="upload" />
                  <span>Nova imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const res = await uploadAvatar(token ?? '', file);
                        const updated = res.data;
                        // atualiza avatar no modal e no topo sem recarregar
                        if (updated?.full_name) {
                          // opcional: usar URL retornada para mostrar preview
                          const img = document.createElement('img');
                          img.src = updated.avatar_url;
                        }
                        setShowProfileModal(true);
                      } catch (err) {
                        console.error('Falha ao enviar avatar', err);
                      }
                    }}
                  />
                </label>
                <button className="danger-icon" title="Remover foto">
                  <img src="/src/assets/icons/trash.svg" alt="remover" />
                </button>
              </div>
            </div>
            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
              <label>
                <span className="field-label">Nome</span>
                <input type="text" defaultValue={user?.full_name || ''} />
              </label>
              <label>
                <span className="field-label">E-mail</span>
                <input type="email" defaultValue={user?.email || ''} />
              </label>
              <label>
                <span className="field-label">Senha</span>
                <div className="password-row">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    value={currentPwd}
                    placeholder="••••••••"
                    onChange={(e) => setCurrentPwd(e.target.value)}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    title={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setPasswordVisible(v => !v)}
                  >
                    <img src="/src/assets/icons/eye.svg" alt="ver" />
                  </button>
                  <button type="button" className="ghost-btn" onClick={() => setShowPwdModal(true)}>Alterar</button>
                </div>
              </label>
              <div className="profile-actions">
                <button type="submit" className="primary-btn">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPwdModal && (
        <div className="profile-modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="pwd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header">
              <h3>Alterar senha</h3>
              <button className="profile-close" onClick={() => setShowPwdModal(false)}>
                <img src="/src/assets/icons/x.svg" alt="fechar" />
              </button>
            </div>
            <form className="profile-form" onSubmit={async (e) => {
              e.preventDefault();
              setPwdMsg('');
              if (!currentPwd || !newPwd) { setPwdMsg('Preencha todos os campos.'); return; }
              if (newPwd !== confirmPwd) { setPwdMsg('As senhas não coincidem.'); return; }
              try {
                setPwdLoading(true);
                await changePassword(token ?? '', currentPwd, newPwd);
                setPwdMsg('Senha alterada com sucesso.');
                setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
                setTimeout(() => setShowPwdModal(false), 800);
              } catch (err: any) {
                setPwdMsg(err?.response?.data?.detail || 'Falha ao alterar senha.');
              } finally { setPwdLoading(false); }
            }}>
              <label>
                <span className="field-label">Senha atual</span>
                <div className="password-row">
                  <input type={currentPwdVisible ? 'text' : 'password'} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
                  <button
                    type="button"
                    className="icon-btn"
                    title={currentPwdVisible ? 'Ocultar' : 'Mostrar'}
                    onClick={() => setCurrentPwdVisible(v => !v)}
                  >
                    <img src="/src/assets/icons/eye.svg" alt="ver" />
                  </button>
                </div>
              </label>
              <label>
                <span className="field-label">Nova senha</span>
                <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </label>
              <label>
                <span className="field-label">Confirmar nova senha</span>
                <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              </label>
              {pwdMsg && <div className="pwd-message">{pwdMsg}</div>}
              <div className="profile-actions">
                <button type="submit" className="primary-btn" disabled={pwdLoading}>{pwdLoading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </aside>
  )
}

export default Sidebar
