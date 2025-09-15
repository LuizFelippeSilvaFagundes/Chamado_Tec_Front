import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface SLAMetrics {
  overallCompliance: number
  criticalCompliance: number
  highCompliance: number
  mediumCompliance: number
  lowCompliance: number
  avgResolutionTime: number
  ticketsInSLA: number
  ticketsOutSLA: number
  urgentTickets: number
}

interface TechnicianPerformance {
  id: number
  name: string
  totalTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  slaCompliance: number
  currentLoad: number
  status: 'online' | 'busy' | 'away'
}

interface SLATicket {
  id: number
  title: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: string
  created_at: string
  sla_deadline: string
  technician: string
  timeRemaining: number
  isOverdue: boolean
}

function SLAMonitoring() {
  const { token } = useAuth()
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null)
  const [technicianPerformance, setTechnicianPerformance] = useState<TechnicianPerformance[]>([])
  const [slaTickets, setSlaTickets] = useState<SLATicket[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchSLAData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchSLAData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, autoRefresh])

  const fetchSLAData = async () => {
    try {
      setLoading(true)
      // Simulação de dados - substituir pela chamada real da API
      const mockMetrics: SLAMetrics = {
        overallCompliance: 94.2,
        criticalCompliance: 98.5,
        highCompliance: 92.1,
        mediumCompliance: 95.8,
        lowCompliance: 89.3,
        avgResolutionTime: 2.5,
        ticketsInSLA: 142,
        ticketsOutSLA: 8,
        urgentTickets: 3
      }

      const mockTechnicians: TechnicianPerformance[] = [
        {
          id: 1,
          name: 'João Silva',
          totalTickets: 45,
          resolvedTickets: 42,
          avgResolutionTime: 2.1,
          slaCompliance: 96.7,
          currentLoad: 8,
          status: 'online'
        },
        {
          id: 2,
          name: 'Maria Santos',
          totalTickets: 38,
          resolvedTickets: 35,
          avgResolutionTime: 2.8,
          slaCompliance: 91.2,
          currentLoad: 12,
          status: 'busy'
        },
        {
          id: 3,
          name: 'Pedro Costa',
          totalTickets: 32,
          resolvedTickets: 30,
          avgResolutionTime: 2.3,
          slaCompliance: 95.1,
          currentLoad: 5,
          status: 'online'
        },
        {
          id: 4,
          name: 'Ana Oliveira',
          totalTickets: 28,
          resolvedTickets: 26,
          avgResolutionTime: 2.6,
          slaCompliance: 89.7,
          currentLoad: 7,
          status: 'away'
        }
      ]

      const mockSLATickets: SLATicket[] = [
        {
          id: 101,
          title: 'Servidor crítico offline',
          priority: 'critical',
          status: 'in-progress',
          created_at: '2024-01-15T14:00:00Z',
          sla_deadline: '2024-01-15T16:00:00Z',
          technician: 'João Silva',
          timeRemaining: 45,
          isOverdue: false
        },
        {
          id: 102,
          title: 'Rede lenta - urgente',
          priority: 'high',
          status: 'pending',
          created_at: '2024-01-15T13:30:00Z',
          sla_deadline: '2024-01-15T17:30:00Z',
          technician: 'Maria Santos',
          timeRemaining: 120,
          isOverdue: false
        },
        {
          id: 103,
          title: 'Impressora não funciona',
          priority: 'medium',
          status: 'in-progress',
          created_at: '2024-01-15T12:00:00Z',
          sla_deadline: '2024-01-15T18:00:00Z',
          technician: 'Pedro Costa',
          timeRemaining: 180,
          isOverdue: false
        },
        {
          id: 104,
          title: 'Computador travando',
          priority: 'low',
          status: 'pending',
          created_at: '2024-01-15T10:00:00Z',
          sla_deadline: '2024-01-16T10:00:00Z',
          technician: 'Ana Oliveira',
          timeRemaining: 900,
          isOverdue: false
        }
      ]

      setSlaMetrics(mockMetrics)
      setTechnicianPerformance(mockTechnicians)
      setSlaTickets(mockSLATickets)
    } catch (error) {
      console.error('Erro ao buscar dados de SLA:', error)
    } finally {
      setLoading(false)
    }
  }

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'compliance-excellent'
    if (compliance >= 90) return 'compliance-good'
    if (compliance >= 80) return 'compliance-warning'
    return 'compliance-critical'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'priority-badge critical'
      case 'high': return 'priority-badge high'
      case 'medium': return 'priority-badge medium'
      case 'low': return 'priority-badge low'
      default: return 'priority-badge low'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'status-online'
      case 'busy': return 'status-busy'
      case 'away': return 'status-away'
      default: return 'status-away'
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}min`
  }

  const getTimeRemainingColor = (timeRemaining: number, priority: string) => {
    const criticalThreshold = priority === 'critical' ? 60 : priority === 'high' ? 120 : 240
    
    if (timeRemaining <= 0) return 'time-overdue'
    if (timeRemaining <= criticalThreshold) return 'time-critical'
    if (timeRemaining <= criticalThreshold * 2) return 'time-warning'
    return 'time-normal'
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando monitoramento de SLA...</p>
      </div>
    )
  }

  if (!slaMetrics) {
    return (
      <div className="error-state">
        <h3>Erro ao carregar dados de SLA</h3>
        <p>Não foi possível carregar as informações de SLA e produtividade.</p>
      </div>
    )
  }

  return (
    <div className="sla-monitoring">
      <div className="section-header">
        <h2>⏱️ SLA & Produtividade</h2>
        <div className="section-actions">
          <div className="refresh-controls">
            <label>
              <input 
                type="checkbox" 
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="refresh-select"
            >
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">1min</option>
              <option value="300">5min</option>
            </select>
          </div>
          <button className="action-btn primary" onClick={fetchSLAData}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Métricas principais de SLA */}
      <div className="stats-grid">
        <div className="stat-card sla-card">
          <h3>Conformidade Geral SLA</h3>
          <div className={`stat-value ${getComplianceColor(slaMetrics.overallCompliance)}`}>
            {slaMetrics.overallCompliance.toFixed(1)}%
          </div>
          <div className="sla-breakdown">
            <div className="sla-item">
              <span>Crítico:</span>
              <span className={getComplianceColor(slaMetrics.criticalCompliance)}>
                {slaMetrics.criticalCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="sla-item">
              <span>Alto:</span>
              <span className={getComplianceColor(slaMetrics.highCompliance)}>
                {slaMetrics.highCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="sla-item">
              <span>Médio:</span>
              <span className={getComplianceColor(slaMetrics.mediumCompliance)}>
                {slaMetrics.mediumCompliance.toFixed(1)}%
              </span>
            </div>
            <div className="sla-item">
              <span>Baixo:</span>
              <span className={getComplianceColor(slaMetrics.lowCompliance)}>
                {slaMetrics.lowCompliance.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Tempo Médio Resolução</h3>
          <div className="stat-value">{slaMetrics.avgResolutionTime.toFixed(1)}h</div>
          <div className="stat-change positive">
            📈 Melhorou 15% este mês
          </div>
        </div>

        <div className="stat-card">
          <h3>Chamados em SLA</h3>
          <div className="stat-value">{slaMetrics.ticketsInSLA}</div>
          <div className="stat-change positive">
            ✅ {slaMetrics.ticketsOutSLA} fora do SLA
          </div>
        </div>

        <div className="stat-card urgent-card">
          <h3>Urgências</h3>
          <div className="stat-value urgent">{slaMetrics.urgentTickets}</div>
          <div className="stat-change negative">
            ⚠️ Requer atenção imediata
          </div>
        </div>
      </div>

      {/* Performance dos técnicos */}
      <div className="performance-section">
        <h3>👥 Performance dos Técnicos</h3>
        <div className="performance-grid">
          {technicianPerformance.map((tech) => (
            <div key={tech.id} className="performance-card">
              <div className="tech-header">
                <div className="tech-info">
                  <h4>{tech.name}</h4>
                  <span className={`status-indicator ${getStatusColor(tech.status)}`}>
                    {tech.status === 'online' ? '🟢' : tech.status === 'busy' ? '🟡' : '🔴'}
                    {tech.status}
                  </span>
                </div>
                <div className="load-indicator">
                  <span>Carga: {tech.currentLoad}</span>
                  <div className="load-bar">
                    <div 
                      className="load-fill"
                      style={{ 
                        width: `${Math.min((tech.currentLoad / 15) * 100, 100)}%`,
                        backgroundColor: tech.currentLoad > 10 ? '#ef4444' : tech.currentLoad > 5 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="tech-metrics">
                <div className="metric-item">
                  <span className="metric-label">SLA:</span>
                  <span className={`metric-value ${getComplianceColor(tech.slaCompliance)}`}>
                    {tech.slaCompliance.toFixed(1)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Resolvidos:</span>
                  <span className="metric-value">{tech.resolvedTickets}/{tech.totalTickets}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Tempo Médio:</span>
                  <span className="metric-value">{tech.avgResolutionTime.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets próximos do SLA */}
      <div className="sla-tickets-section">
        <h3>🎯 Tickets com SLA Ativo</h3>
        <div className="table-container">
          <table className="tech-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Técnico</th>
                <th>Tempo Restante</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {slaTickets.map((ticket) => (
                <tr key={ticket.id} className={ticket.isOverdue ? 'overdue-row' : ''}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>
                    <span className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>{ticket.technician}</td>
                  <td>
                    <span className={`time-remaining ${getTimeRemainingColor(ticket.timeRemaining, ticket.priority)}`}>
                      {ticket.isOverdue ? 'VENCIDO' : formatTime(ticket.timeRemaining)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn primary" title="Ver detalhes">
                        👁️
                      </button>
                      <button className="action-btn secondary" title="Chat">
                        💬
                      </button>
                      <button className="action-btn success" title="Priorizar">
                        ⚡
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas e notificações */}
      <div className="alerts-section">
        <h3>🚨 Alertas de SLA</h3>
        <div className="alerts-grid">
          <div className="alert-card warning">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>3 tickets críticos próximos do vencimento</h4>
              <p>Requerem atenção imediata para manter SLA</p>
            </div>
          </div>
          <div className="alert-card info">
            <div className="alert-icon">ℹ️</div>
            <div className="alert-content">
              <h4>Conformidade SLA abaixo da meta</h4>
              <p>Meta: 95% | Atual: {slaMetrics.overallCompliance.toFixed(1)}%</p>
            </div>
          </div>
          <div className="alert-card success">
            <div className="alert-icon">✅</div>
            <div className="alert-content">
              <h4>Performance excelente este mês</h4>
              <p>Tempo médio de resolução melhorou 15%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SLAMonitoring
