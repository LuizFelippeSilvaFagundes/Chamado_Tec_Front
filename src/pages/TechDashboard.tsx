import { useState } from 'react'
import Header from '../components/Header'
import TechSidebar from '../components/TechSidebar'
import AssignedTickets from '../components/tech/AssignedTickets'
import TicketManagement from '../components/tech/TicketManagement'
import ChatInterface from '../components/tech/ChatInterface'
import EquipmentHistory from '../components/tech/EquipmentHistory'
import TechReports from '../components/tech/TechReports'
import SLAMonitoring from '../components/tech/SLAMonitoring'
import ApprovalSystem from '../components/tech/ApprovalSystem'
import TechApproval from '../components/tech/TechApproval'
import { useAuth } from '../contexts/AuthContext'
import './TechDashboard.css'

type ActiveSection = 'assigned-tickets' | 'ticket-management' | 'chat' | 'equipment-history' | 'reports' | 'sla-monitoring' | 'approval' | 'tech-approval'

function TechDashboard() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState<ActiveSection>('assigned-tickets')

  const handleLogout = () => {
    logout()
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'assigned-tickets':
        return <AssignedTickets />
      case 'ticket-management':
        return <TicketManagement />
      case 'chat':
        return <ChatInterface />
      case 'equipment-history':
        return <EquipmentHistory />
      case 'reports':
        return <TechReports />
      case 'sla-monitoring':
        return <SLAMonitoring />
      case 'approval':
        return <ApprovalSystem />
      case 'tech-approval':
        return <TechApproval />
      default:
        return <AssignedTickets />
    }
  }

  return (
    <div className="tech-dashboard-container">
      <Header userName={user?.full_name || ''} onLogout={handleLogout} />
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
