import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface ChatMessage {
  id: number
  ticket_id: number
  sender_type: 'user' | 'technician'
  sender_name: string
  message: string
  timestamp: string
  attachments?: string[]
}

interface ChatTicket {
  id: number
  title: string
  user_name: string
  status: string
  last_message?: string
  last_message_time?: string
  unread_count: number
}

function ChatInterface() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<ChatTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<ChatTicket | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatTickets()
  }, [])

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id)
    }
  }, [selectedTicket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatTickets = async () => {
    try {
      setLoading(true)
      // Simulação de dados - substituir pela chamada real da API
      const mockTickets: ChatTicket[] = [
        {
          id: 1,
          title: 'Computador não liga',
          user_name: 'João Silva',
          status: 'in-progress',
          last_message: 'Olá, você pode me ajudar com o computador?',
          last_message_time: '2024-01-15T14:30:00Z',
          unread_count: 2
        },
        {
          id: 2,
          title: 'Problema com impressora',
          user_name: 'Maria Santos',
          status: 'pending',
          last_message: 'A impressora não está funcionando',
          last_message_time: '2024-01-15T13:45:00Z',
          unread_count: 1
        },
        {
          id: 3,
          title: 'Sistema lento',
          user_name: 'Pedro Costa',
          status: 'resolved',
          last_message: 'Obrigado pela ajuda!',
          last_message_time: '2024-01-15T12:20:00Z',
          unread_count: 0
        }
      ]
      setTickets(mockTickets)
      if (mockTickets.length > 0) {
        setSelectedTicket(mockTickets[0])
      }
    } catch (error) {
      console.error('Erro ao buscar tickets de chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (ticketId: number) => {
    try {
      // Simulação de dados - substituir pela chamada real da API
      const mockMessages: ChatMessage[] = [
        {
          id: 1,
          ticket_id: ticketId,
          sender_type: 'user',
          sender_name: 'João Silva',
          message: 'Olá, meu computador não está ligando. Você pode me ajudar?',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          ticket_id: ticketId,
          sender_type: 'technician',
          sender_name: user?.full_name || 'Técnico',
          message: 'Olá João! Claro, vou te ajudar. Pode me dizer se há algum sinal de energia no computador?',
          timestamp: '2024-01-15T10:35:00Z'
        },
        {
          id: 3,
          ticket_id: ticketId,
          sender_type: 'user',
          sender_name: 'João Silva',
          message: 'Não há nenhuma luz acesa. A fonte parece estar funcionando porque faz barulho, mas o computador não liga.',
          timestamp: '2024-01-15T14:30:00Z'
        },
        {
          id: 4,
          ticket_id: ticketId,
          sender_type: 'technician',
          sender_name: user?.full_name || 'Técnico',
          message: 'Entendi. Vamos verificar algumas coisas. Primeiro, pode tentar trocar o cabo de energia? Se não resolver, pode ser problema na placa mãe.',
          timestamp: '2024-01-15T14:32:00Z'
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return

    try {
      const messageData = {
        ticket_id: selectedTicket.id,
        message: newMessage.trim(),
        sender_type: 'technician',
        sender_name: user?.full_name || 'Técnico'
      }

      // Simulação de envio - substituir pela chamada real da API
      console.log('Enviando mensagem:', messageData)

      const newMessageObj: ChatMessage = {
        id: Date.now(),
        ticket_id: selectedTicket.id,
        sender_type: 'technician',
        sender_name: user?.full_name || 'Técnico',
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, newMessageObj])
      setNewMessage('')

      // Simular resposta automática do usuário (para demonstração)
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: Date.now() + 1,
          ticket_id: selectedTicket.id,
          sender_type: 'user',
          sender_name: selectedTicket.user_name,
          message: 'Entendi, vou tentar isso. Obrigado!',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, autoReply])
      }, 2000)

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando chat...</p>
      </div>
    )
  }

  return (
    <div className="chat-interface">
      <div className="section-header">
        <h2>💬 Chat com Usuários</h2>
        <div className="section-actions">
          <button className="action-btn primary" onClick={fetchChatTickets}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="chat-container">
        {/* Lista de conversas */}
        <div className="chat-sidebar">
          <div className="chat-header">
            <h3>Conversas Ativas</h3>
            <span className="chat-count">{tickets.length}</span>
          </div>
          
          <div className="chat-list">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id}
                className={`chat-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="chat-item-header">
                  <span className="ticket-title">#{ticket.id} {ticket.title}</span>
                  {ticket.unread_count > 0 && (
                    <span className="unread-badge">{ticket.unread_count}</span>
                  )}
                </div>
                <div className="chat-item-user">{ticket.user_name}</div>
                <div className="chat-item-preview">
                  {ticket.last_message}
                </div>
                <div className="chat-item-time">
                  {ticket.last_message_time && formatTime(ticket.last_message_time)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área de chat */}
        <div className="chat-main">
          {selectedTicket ? (
            <>
              <div className="chat-main-header">
                <div className="chat-info">
                  <h4>#{selectedTicket.id} {selectedTicket.title}</h4>
                  <p>Conversando com {selectedTicket.user_name}</p>
                </div>
                <div className="chat-status">
                  <span className={`status-badge ${selectedTicket.status}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`message ${message.sender_type === 'technician' ? 'sent' : 'received'}`}
                  >
                    <div className="message-header">
                      <span className="sender-name">{message.sender_name}</span>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="message-content">
                      {message.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <div className="input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="message-input"
                    rows={2}
                  />
                  <button 
                    className="send-button"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    📤
                  </button>
                </div>
                <div className="input-actions">
                  <button className="action-btn secondary" title="Anexar arquivo">
                    📎 Anexar
                  </button>
                  <button className="action-btn secondary" title="Enviar template">
                    📝 Template
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Selecione uma conversa</h3>
              <p>Escolha um chamado na lista ao lado para iniciar o chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
