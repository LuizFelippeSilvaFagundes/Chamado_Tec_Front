import { useState } from 'react'
import TechSidebar from '../components/TechSidebar'
import AssignedTickets from '../components/tech/AssignedTickets'
import TicketManagement from '../components/tech/TicketManagement'
import TechReports from '../components/tech/TechReports'
import KnowledgeBase from '../components/KnowledgeBase'
import './TechDashboard.css'

type ActiveSection = 'ticket-management' | 'assigned-tickets' | 'reports' | 'knowledge-base'

function TechDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('ticket-management')

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'ticket-management':
        return <TicketManagement />
      case 'assigned-tickets':
        return <AssignedTickets />
      case 'reports':
        return <TechReports />
      case 'knowledge-base':
        return <KnowledgeBase />
      default:
        return <TicketManagement />
    }
  }

  return (
    <div className="tech-dashboard-container">
      <div className="tech-dashboard-content">
        <TechSidebar 
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

export default TechDashboard
