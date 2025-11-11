import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import OpenTicket from '../components/OpenTicket'
import MyTickets from '../components/MyTickets'
import KnowledgeBase from '../components/KnowledgeBase'
import { useAuth } from '../contexts/AuthContext'
import './UserDashboard.css'

type ActiveSection = 'open-ticket' | 'my-tickets' | 'knowledge-base'

function UserDashboard() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<ActiveSection>('open-ticket')

  console.log('🔍 UserDashboard renderizando:', { user, activeSection })

  // Função para mudar seção (será passada para OpenTicket)
  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'open-ticket':
        return <OpenTicket onTicketCreated={() => handleSectionChange('my-tickets')} />
      case 'my-tickets':
        return <MyTickets />
      case 'knowledge-base':
        return <KnowledgeBase />
      default:
        return <OpenTicket onTicketCreated={() => handleSectionChange('my-tickets')} />
    }
  }

  // Componente de teste simples primeiro
  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Carregando...</h1>
        <p>Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="main-content">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  )
}

export default UserDashboard
