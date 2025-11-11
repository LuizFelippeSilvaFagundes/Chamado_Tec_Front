import { useState, useEffect, useRef } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { formatDateTime } from '../utils/dateUtils'
import './NotificationCenter.css'

function NotificationCenter() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Escutar eventos de nova notificação
  useEffect(() => {
    const handleNewNotification = () => {
      // Recarregar notificações quando uma nova for criada
      // O contexto já faz isso automaticamente, mas podemos forçar atualização
    }

    window.addEventListener('notification-created', handleNewNotification)
    return () => window.removeEventListener('notification-created', handleNewNotification)
  }, [])

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket_assigned':
        return '🎫'
      case 'ticket_resolved':
        return '✅'
      case 'approval':
        return '✔️'
      case 'sla_alert':
        return '⏰'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ticket_assigned':
        return '#3b82f6'
      case 'ticket_resolved':
        return '#10b981'
      case 'approval':
        return '#8b5cf6'
      case 'sla_alert':
        return '#f59e0b'
      case 'success':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Se tiver link, navegar
    if (notification.link) {
      window.location.href = notification.link
    } else if (notification.ticket_id) {
      // Navegar para o ticket
      window.location.href = `/admin-dashboard?ticket=${notification.ticket_id}`
    }
  }

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notificações</h3>
            <div className="notification-actions">
              <button
                className="action-btn"
                onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                title={filter === 'all' ? 'Mostrar apenas não lidas' : 'Mostrar todas'}
              >
                {filter === 'all' ? '📋' : '👁️'}
              </button>
              {unreadCount > 0 && (
                <button
                  className="action-btn"
                  onClick={markAllAsRead}
                  title="Marcar todas como lidas"
                >
                  ✓
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="action-btn danger"
                  onClick={clearAll}
                  title="Limpar todas"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          <div className="notification-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Não lidas ({unreadCount})
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <p>Carregando notificações...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <p>📭 Nenhuma notificação {filter === 'unread' ? 'não lida' : ''}</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className="notification-icon"
                    style={{ backgroundColor: getNotificationColor(notification.type) }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatDateTime(notification.created_at)}
                    </div>
                  </div>
                  <div className="notification-actions-item">
                    {!notification.read && (
                      <button
                        className="mark-read-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        title="Marcar como lida"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      title="Deletar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter

