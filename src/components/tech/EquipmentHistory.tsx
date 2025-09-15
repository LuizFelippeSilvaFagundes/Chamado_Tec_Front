import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

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
    fetchEquipments()
  }, [])

  useEffect(() => {
    if (selectedEquipment) {
      fetchEquipmentHistory(selectedEquipment.id)
    }
  }, [selectedEquipment])

  const fetchEquipments = async () => {
    try {
      setLoading(true)
      // Simulação de dados - substituir pela chamada real da API
      const mockEquipments: Equipment[] = [
        {
          id: 'PC-001',
          name: 'Desktop Administração',
          type: 'computer',
          model: 'Dell OptiPlex 7090',
          serial_number: 'DL709001234',
          location: 'Sala 201 - Administração',
          status: 'active',
          purchase_date: '2023-03-15',
          warranty_expiry: '2026-03-15',
          assigned_user: 'João Silva',
          department: 'Administração'
        },
        {
          id: 'PC-002',
          name: 'Desktop Financeiro',
          type: 'computer',
          model: 'HP EliteDesk 800',
          serial_number: 'HP800567890',
          location: 'Sala 105 - Financeiro',
          status: 'maintenance',
          purchase_date: '2022-08-20',
          warranty_expiry: '2025-08-20',
          assigned_user: 'Maria Santos',
          department: 'Financeiro'
        },
        {
          id: 'PRINT-001',
          name: 'Impressora Multifuncional',
          type: 'printer',
          model: 'HP LaserJet Pro M404n',
          serial_number: 'HP404987654',
          location: 'Sala 201 - Administração',
          status: 'active',
          purchase_date: '2023-01-10',
          warranty_expiry: '2025-01-10',
          assigned_user: 'Departamento',
          department: 'Administração'
        }
      ]
      setEquipments(mockEquipments)
      if (mockEquipments.length > 0) {
        setSelectedEquipment(mockEquipments[0])
      }
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEquipmentHistory = async (equipmentId: string) => {
    try {
      // Simulação de dados - substituir pela chamada real da API
      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: 1,
          equipment_id: equipmentId,
          type: 'preventive',
          description: 'Limpeza geral e verificação de componentes',
          technician: 'Técnico Silva',
          date: '2024-01-10',
          cost: 150.00,
          parts_used: ['Ar comprimido', 'Pasta térmica'],
          notes: 'Equipamento em bom estado, apenas limpeza preventiva realizada.'
        },
        {
          id: 2,
          equipment_id: equipmentId,
          type: 'corrective',
          description: 'Substituição de fonte de alimentação',
          technician: 'Técnico Santos',
          date: '2023-11-15',
          cost: 280.00,
          parts_used: ['Fonte 500W', 'Cabos de alimentação'],
          notes: 'Fonte original apresentou falha, substituída por nova.'
        }
      ]

      const mockTickets: TicketRecord[] = [
        {
          id: 15,
          equipment_id: equipmentId,
          title: 'Computador não liga',
          description: 'Usuário relata que o computador não está ligando',
          priority: 'high',
          status: 'resolved',
          user_name: 'João Silva',
          created_at: '2024-01-15T10:30:00Z',
          resolved_at: '2024-01-15T14:30:00Z',
          technician: 'Técnico Atual'
        },
        {
          id: 8,
          equipment_id: equipmentId,
          title: 'Sistema lento',
          description: 'Computador muito lento para trabalhar',
          priority: 'medium',
          status: 'resolved',
          user_name: 'João Silva',
          created_at: '2023-12-20T09:15:00Z',
          resolved_at: '2023-12-20T11:30:00Z',
          technician: 'Técnico Silva'
        }
      ]

      setMaintenanceHistory(mockMaintenance)
      setTicketHistory(mockTickets)
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
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
