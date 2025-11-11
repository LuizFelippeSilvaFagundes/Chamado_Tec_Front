import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { apiWithAuth } from '../api/api'

export interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'ticket_assigned' | 'ticket_resolved' | 'approval' | 'sla_alert'
  read: boolean
  created_at: string
  ticket_id?: number
  link?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  clearAll: () => Promise<void>
  fetchNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([])
      return
    }

    try {
      setLoading(true)
      const apiAuth = apiWithAuth(token)
      
      // Tentar buscar notificações da API
      try {
        const response = await apiAuth.get('/notifications')
        const data = response.data || []
        
        // Formatar notificações
        const formattedNotifications: Notification[] = data.map((notif: any) => ({
          id: notif.id,
          title: notif.title || notif.message?.substring(0, 50) || 'Notificação',
          message: notif.message || notif.title || '',
          type: notif.type || 'info',
          read: notif.read || false,
          created_at: notif.created_at || notif.timestamp || new Date().toISOString(),
          ticket_id: notif.ticket_id,
          link: notif.link
        }))
        
        setNotifications(formattedNotifications)
      } catch (error: any) {
        // Se a API não existir, criar notificações mockadas baseadas em eventos do sistema
        console.log('⚠️ Endpoint de notificações não disponível, usando notificações locais')
        
        // Buscar notificações do localStorage (fallback)
        const storedNotifications = localStorage.getItem('notifications')
        if (storedNotifications) {
          const parsed = JSON.parse(storedNotifications)
          setNotifications(parsed)
        } else {
          // Criar notificações iniciais vazias
          setNotifications([])
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [token])

  const markAsRead = useCallback(async (id: number) => {
    if (!token) return

    try {
      const apiAuth = apiWithAuth(token)
      
      // Tentar marcar como lida na API
      try {
        await apiAuth.put(`/notifications/${id}/read`)
      } catch (error) {
        console.log('⚠️ Endpoint de marcação como lida não disponível, usando localStorage')
      }

      // Atualizar localmente
      setNotifications(prev => {
        const updated = prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
        // Salvar no localStorage como fallback
        localStorage.setItem('notifications', JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error)
    }
  }, [token])

  const markAllAsRead = useCallback(async () => {
    if (!token) return

    try {
      const apiAuth = apiWithAuth(token)
      
      // Tentar marcar todas como lidas na API
      try {
        await apiAuth.put('/notifications/read-all')
      } catch (error) {
        console.log('⚠️ Endpoint de marcar todas como lidas não disponível, usando localStorage')
      }

      // Atualizar localmente
      setNotifications(prev => {
        const updated = prev.map(notif => ({ ...notif, read: true }))
        // Salvar no localStorage como fallback
        localStorage.setItem('notifications', JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error)
    }
  }, [token])

  const deleteNotification = useCallback(async (id: number) => {
    if (!token) return

    try {
      const apiAuth = apiWithAuth(token)
      
      // Tentar deletar na API
      try {
        await apiAuth.delete(`/notifications/${id}`)
      } catch (error) {
        console.log('⚠️ Endpoint de deletar notificação não disponível, usando localStorage')
      }

      // Atualizar localmente
      setNotifications(prev => {
        const updated = prev.filter(notif => notif.id !== id)
        // Salvar no localStorage como fallback
        localStorage.setItem('notifications', JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error)
    }
  }, [token])

  const clearAll = useCallback(async () => {
    if (!token) return

    try {
      const apiAuth = apiWithAuth(token)
      
      // Tentar limpar todas na API
      try {
        await apiAuth.delete('/notifications')
      } catch (error) {
        console.log('⚠️ Endpoint de limpar notificações não disponível, usando localStorage')
      }

      // Limpar localmente
      setNotifications([])
      localStorage.removeItem('notifications')
    } catch (error) {
      console.error('❌ Erro ao limpar notificações:', error)
    }
  }, [token])

  // Buscar notificações quando o token mudar
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling para atualizar notificações a cada 30 segundos
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [token, fetchNotifications])

  // Escutar eventos de nova notificação e storage (para sincronizar entre abas)
  useEffect(() => {
    const handleNotificationCreated = () => {
      fetchNotifications()
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        fetchNotifications()
      }
    }

    window.addEventListener('notification-created', handleNotificationCreated)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('notification-created', handleNotificationCreated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    fetchNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Função helper para criar notificações localmente (quando API não está disponível)
export const createLocalNotification = (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
  const storedNotifications = localStorage.getItem('notifications')
  const notifications: Notification[] = storedNotifications ? JSON.parse(storedNotifications) : []
  
  const newNotification: Notification = {
    ...notification,
    id: Date.now() + Math.random(), // Usar timestamp + random como ID temporário
    read: false,
    created_at: new Date().toISOString()
  }
  
  notifications.unshift(newNotification) // Adicionar no início
  // Manter apenas as últimas 50 notificações
  const limitedNotifications = notifications.slice(0, 50)
  localStorage.setItem('notifications', JSON.stringify(limitedNotifications))
  
  // Disparar evento customizado para atualizar o contexto
  window.dispatchEvent(new CustomEvent('notification-created', { detail: newNotification }))
  
  // Também disparar um evento de storage para sincronizar entre abas
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'notifications',
    newValue: JSON.stringify(limitedNotifications)
  }))
  
  return newNotification
}

