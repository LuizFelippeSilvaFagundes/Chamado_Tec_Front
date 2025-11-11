import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getEquipments, getEquipmentHistory as getEquipmentHistoryAPI, getEquipmentTickets } from '../../api/api'

interface Equipment {
  id: string
  name: string
  type: string
  model: string
  serial_number: string
  location: string
  status: 'active' | 'maintenance' | 'inactive'
  purchase_date: string
  warranty_expiry: string
  assigned_user: string
  department: string
}

interface MaintenanceRecord {
  id: number
  equipment_id: string
  type: 'preventive' | 'corrective' | 'upgrade'
  description: string
  technician: string
  date: string
  cost: number
  parts_used: string[]
  notes: string
}

interface TicketRecord {
  id: number
  equipment_id: string
  title: string
  description: string
  priority: string
  status: string
  user_name: string
  created_at: string
  resolved_at?: string
  technician: string
}

function EquipmentHistory() {
  const { token } = useAuth()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([])
  const [ticketHistory, setTicketHistory] = useState<TicketRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'computer' | 'printer' | 'network'>('all')

  useEffect(() => {
    if (token) {
      fetchEquipments()
    }
  }, [token])

  useEffect(() => {
    if (selectedEquipment && token) {
      fetchEquipmentHistory(selectedEquipment.id)
    }
  }, [selectedEquipment, token])

  const fetchEquipments = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        console.error('❌ Token não disponível')
        return
      }

      console.log('🖥️ Buscando equipamentos da API...')
      
      try {
        const response = await getEquipments(token)
        const data = response.data || []

        const equipmentsData: Equipment[] = data.map((eq: any) => ({
          id: eq.id || eq.equipment_id || `EQ${eq.id}`,
          name: eq.name || eq.equipment_name || 'Equipamento',
          type: eq.type || eq.equipment_type || 'computer',
          model: eq.model || eq.model_name || 'N/A',
          serial_number: eq.serial_number || eq.serial || 'N/A',
          location: eq.location || eq.office_location || 'Não especificado',
          status: (eq.status || 'active') as Equipment['status'],
          purchase_date: eq.purchase_date || eq.purchased_at || new Date().toISOString().split('T')[0],
          warranty_expiry: eq.warranty_expiry || eq.warranty_expires || eq.warranty_expiry_date || new Date().toISOString().split('T')[0],
          assigned_user: eq.assigned_user?.full_name || eq.user_name || eq.assigned_user || 'Não atribuído',
          department: eq.department || eq.department_name || 'N/A'
        }))

        setEquipments(equipmentsData)
        if (equipmentsData.length > 0 && !selectedEquipment) {
          setSelectedEquipment(equipmentsData[0])
        }
        console.log('✅ Equipamentos carregados:', equipmentsData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar equipamentos:', error.response?.data || error.message)
        setEquipments([])
      }
    } catch (error) {
      console.error('❌ Erro geral ao buscar equipamentos:', error)
      setEquipments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEquipmentHistory = async (equipmentId: string) => {
    try {
      if (!token) {
        console.error('❌ Token não disponível')
        return
      }

      console.log('📋 Buscando histórico do equipamento', equipmentId, 'da API...')
      
      // Buscar histórico de manutenção
      try {
        const historyResponse = await getEquipmentHistoryAPI(token, equipmentId)
        const historyData = historyResponse.data || []

        const maintenanceData: MaintenanceRecord[] = historyData.map((record: any) => ({
          id: record.id,
          equipment_id: equipmentId,
          type: (record.type || record.maintenance_type || 'preventive') as MaintenanceRecord['type'],
          description: record.description || record.notes || '',
          technician: record.technician?.full_name || record.technician_name || 'Técnico',
          date: record.date || record.maintenance_date || record.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          cost: record.cost || record.maintenance_cost || 0,
          parts_used: Array.isArray(record.parts_used) ? record.parts_used : (record.parts_used ? [record.parts_used] : []),
          notes: record.notes || record.observations || ''
        }))

        setMaintenanceHistory(maintenanceData)
        console.log('✅ Histórico de manutenção carregado:', maintenanceData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar histórico de manutenção:', error.response?.data || error.message)
        setMaintenanceHistory([])
      }

      // Buscar tickets relacionados
      try {
        const ticketsResponse = await getEquipmentTickets(token, equipmentId)
        const ticketsData = ticketsResponse.data || []

        const ticketData: TicketRecord[] = ticketsData.map((ticket: any) => ({
          id: ticket.id,
          equipment_id: equipmentId,
          title: ticket.title || 'Sem título',
          description: ticket.description || '',
          priority: ticket.priority || 'medium',
          status: ticket.status || 'open',
          user_name: ticket.user?.full_name || ticket.user_name || 'Usuário',
          created_at: ticket.created_at || new Date().toISOString(),
          resolved_at: ticket.resolved_at || ticket.closed_at,
          technician: ticket.assigned_technician?.full_name || ticket.technician_name || 'Não atribuído'
        }))

        setTicketHistory(ticketData)
        console.log('✅ Tickets do equipamento carregados:', ticketData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar tickets do equipamento:', error.response?.data || error.message)
        setTicketHistory([])
      }
    } catch (error) {
      console.error('❌ Erro geral ao buscar histórico do equipamento:', error)
      setMaintenanceHistory([])
      setTicketHistory([])
    }
  }

  const filteredEquipments = equipments.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.assigned_user.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || equipment.type === filterType
    
    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-badge resolved'
      case 'maintenance': return 'status-badge in-progress'
      case 'inactive': return 'status-badge closed'
      default: return 'status-badge pending'
    }
  }

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'maintenance-badge preventive'
      case 'corrective': return 'maintenance-badge corrective'
      case 'upgrade': return 'maintenance-badge upgrade'
      default: return 'maintenance-badge preventive'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando histórico de equipamentos...</p>
      </div>
    )
  }

  return (
    <div className="equipment-history">
      <div className="section-header">
        <h2>🖥️ Histórico de Equipamentos</h2>
        <div className="section-actions">
          <button className="action-btn primary" onClick={fetchEquipments}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="equipment-layout">
        {/* Lista de equipamentos */}
        <div className="equipment-list">
          <div className="filters-container">
            <div className="filters-row">
              <div className="form-group">
                <label>Buscar:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID, nome, usuário..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="form-select"
                >
                  <option value="all">Todos</option>
                  <option value="computer">Computadores</option>
                  <option value="printer">Impressoras</option>
                  <option value="network">Rede</option>
                </select>
              </div>
            </div>
          </div>

          <div className="equipment-grid">
            {filteredEquipments.map((equipment) => (
              <div 
                key={equipment.id}
                className={`equipment-card ${selectedEquipment?.id === equipment.id ? 'selected' : ''}`}
                onClick={() => setSelectedEquipment(equipment)}
              >
                <div className="equipment-header">
                  <span className="equipment-id">{equipment.id}</span>
                  <span className={getStatusColor(equipment.status)}>
                    {equipment.status}
                  </span>
                </div>
                <h4>{equipment.name}</h4>
                <div className="equipment-details">
                  <p><strong>Modelo:</strong> {equipment.model}</p>
                  <p><strong>Usuário:</strong> {equipment.assigned_user}</p>
                  <p><strong>Local:</strong> {equipment.location}</p>
                  <p><strong>Departamento:</strong> {equipment.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico do equipamento selecionado */}
        {selectedEquipment && (
          <div className="equipment-details">
            <div className="details-header">
              <h3>{selectedEquipment.name} - {selectedEquipment.id}</h3>
              <span className={getStatusColor(selectedEquipment.status)}>
                {selectedEquipment.status}
              </span>
            </div>

            <div className="details-content">
              {/* Informações do equipamento */}
              <div className="detail-section">
                <h4>📋 Informações do Equipamento</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Modelo:</label>
                    <span>{selectedEquipment.model}</span>
                  </div>
                  <div className="detail-item">
                    <label>Série:</label>
                    <span>{selectedEquipment.serial_number}</span>
                  </div>
                  <div className="detail-item">
                    <label>Localização:</label>
                    <span>{selectedEquipment.location}</span>
                  </div>
                  <div className="detail-item">
                    <label>Departamento:</label>
                    <span>{selectedEquipment.department}</span>
                  </div>
                  <div className="detail-item">
                    <label>Usuário Atual:</label>
                    <span>{selectedEquipment.assigned_user}</span>
                  </div>
                  <div className="detail-item">
                    <label>Data de Compra:</label>
                    <span>{formatDate(selectedEquipment.purchase_date)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Garantia:</label>
                    <span>{formatDate(selectedEquipment.warranty_expiry)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={getStatusColor(selectedEquipment.status)}>
                      {selectedEquipment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Histórico de manutenção */}
              <div className="detail-section">
                <h4>🔧 Histórico de Manutenção</h4>
                <div className="history-table">
                  <table className="tech-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th>Técnico</th>
                        <th>Custo</th>
                        <th>Peças</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceHistory.map((record) => (
                        <tr key={record.id}>
                          <td>{formatDate(record.date)}</td>
                          <td>
                            <span className={getMaintenanceTypeColor(record.type)}>
                              {record.type}
                            </span>
                          </td>
                          <td>{record.description}</td>
                          <td>{record.technician}</td>
                          <td>{formatCurrency(record.cost)}</td>
                          <td>
                            <div className="parts-list">
                              {record.parts_used.map((part, index) => (
                                <span key={index} className="part-tag">{part}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Histórico de chamados */}
              <div className="detail-section">
                <h4>🎫 Histórico de Chamados</h4>
                <div className="history-table">
                  <table className="tech-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Usuário</th>
                        <th>Prioridade</th>
                        <th>Status</th>
                        <th>Criado</th>
                        <th>Resolvido</th>
                        <th>Técnico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketHistory.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>#{ticket.id}</td>
                          <td>{ticket.title}</td>
                          <td>{ticket.user_name}</td>
                          <td>
                            <span className={`priority-badge ${ticket.priority}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${ticket.status}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td>{formatDate(ticket.created_at)}</td>
                          <td>{ticket.resolved_at ? formatDate(ticket.resolved_at) : '-'}</td>
                          <td>{ticket.technician}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EquipmentHistory
