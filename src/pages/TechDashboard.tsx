import { useState } from 'react'
import TechSidebar from '../components/TechSidebar'
import AssignedTickets from '../components/tech/AssignedTickets'
import TicketManagement from '../components/tech/TicketManagement'
import AdminAssignedTickets from '../components/tech/AdminAssignedTickets'
// Chat removido - usa WhatsApp
import EquipmentHistory from '../components/tech/EquipmentHistory'
import TechReports from '../components/tech/TechReports'
import SLAMonitoring from '../components/tech/SLAMonitoring'
import ApprovalSystem from '../components/tech/ApprovalSystem'
import TechApproval from '../components/tech/TechApproval'
import { useAuth } from '../contexts/AuthContext'
import './TechDashboard.css'

type ActiveSection = 'ticket-management' | 'assigned-tickets' | 'admin-assigned-tickets' | 'equipment-history' | 'reports' | 'sla-monitoring' | 'approval' | 'tech-approval'

function TechDashboard() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState<ActiveSection>('ticket-management')

  const handleLogout = () => {
    logout()
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'ticket-management':
        return <TicketManagement onTicketTaken={() => setActiveSection('assigned-tickets')} />
      case 'assigned-tickets':
        return <AssignedTickets />
      case 'admin-assigned-tickets':
        return <AdminAssignedTickets />
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
        return <TicketManagement onTicketTaken={() => setActiveSection('assigned-tickets')} />
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
