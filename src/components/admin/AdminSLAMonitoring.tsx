import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getSLATechnicianPerformance, getTecnicosTodos, apiWithAuth } from '../../api/api'

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

interface Technician {
  id: number
  full_name: string
  email: string
  is_active: boolean
  is_approved: boolean
}

function AdminSLAMonitoring() {
  const { token } = useAuth()
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null)
  const [technicianPerformance, setTechnicianPerformance] = useState<TechnicianPerformance[]>([])
  const [slaTickets, setSlaTickets] = useState<SLATicket[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (token) {
      fetchTechnicians()
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchSLAData()
    }
  }, [token, selectedTechnicianId])

  useEffect(() => {
    if (!autoRefresh || !token) return
    
    const interval = setInterval(fetchSLAData, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [refreshInterval, autoRefresh, token, selectedTechnicianId])

  // Calcular tempo restante até deadline
  const calculateTimeRemaining = (deadline: string): number => {
    const now = new Date().getTime()
    const deadlineTime = new Date(deadline).getTime()
    const diffMs = deadlineTime - now
    return Math.max(0, Math.floor(diffMs / (1000 * 60))) // Retorna em minutos
  }

  const fetchTechnicians = async () => {
    try {
      if (!token) return

      console.log('👥 Buscando técnicos para seleção...')
      
      const response = await getTecnicosTodos()
      const data = response.data || []

      const techniciansData: Technician[] = data
        .filter((tech: any) => tech.is_active && tech.is_approved)
        .map((tech: any) => ({
          id: tech.id,
          full_name: tech.full_name || tech.name || 'Técnico',
          email: tech.email || '',
          is_active: tech.is_active || false,
          is_approved: tech.is_approved || false
        }))

      setTechnicians(techniciansData)
      console.log('✅ Técnicos carregados:', techniciansData)
    } catch (error: any) {
      console.error('❌ Erro ao buscar técnicos:', error.response?.data || error.message)
      setTechnicians([])
    }
  }

  const fetchSLAData = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        console.error('❌ Token não disponível')
        return
      }

      console.log('⏱️ Buscando dados de SLA da API...')
      
      // Buscar métricas de SLA (geral ou filtrado por técnico)
      try {
        const endpoint = selectedTechnicianId 
          ? `/sla/metrics?technician_id=${selectedTechnicianId}`
          : '/sla/metrics'
        
        const apiAuth = apiWithAuth(token)
        const metricsResponse = await apiAuth.get(endpoint)
        const metricsData = metricsResponse.data

        if (metricsData) {
          const slaMetricsData: SLAMetrics = {
            overallCompliance: metricsData?.overall_compliance ?? metricsData?.overallCompliance ?? 0,
            criticalCompliance: metricsData?.critical_compliance ?? metricsData?.criticalCompliance ?? 0,
            highCompliance: metricsData?.high_compliance ?? metricsData?.highCompliance ?? 0,
            mediumCompliance: metricsData?.medium_compliance ?? metricsData?.mediumCompliance ?? 0,
            lowCompliance: metricsData?.low_compliance ?? metricsData?.lowCompliance ?? 0,
            avgResolutionTime: metricsData?.avg_resolution_time ?? metricsData?.avgResolutionTime ?? 0,
            ticketsInSLA: metricsData?.tickets_in_sla ?? metricsData?.ticketsInSLA ?? 0,
            ticketsOutSLA: metricsData?.tickets_out_sla ?? metricsData?.ticketsOutSLA ?? 0,
            urgentTickets: metricsData?.urgent_tickets ?? metricsData?.urgentTickets ?? 0
          }

          setSlaMetrics(slaMetricsData)
          console.log('✅ Métricas de SLA carregadas:', slaMetricsData)
        }
      } catch (error: any) {
        console.error('❌ Erro ao buscar métricas de SLA:', error.response?.data || error.message)
        setSlaMetrics({
          overallCompliance: 0,
          criticalCompliance: 0,
          highCompliance: 0,
          mediumCompliance: 0,
          lowCompliance: 0,
          avgResolutionTime: 0,
          ticketsInSLA: 0,
          ticketsOutSLA: 0,
          urgentTickets: 0
        })
      }

      // Buscar performance dos técnicos
      try {
        const performanceResponse = await getSLATechnicianPerformance(token)
        const performanceData = performanceResponse.data || []

        const techniciansData: TechnicianPerformance[] = performanceData.map((tech: any) => ({
          id: tech.id || tech.technician_id,
          name: tech.full_name || tech.name || 'Técnico',
          totalTickets: tech.total_tickets || tech.tickets_count || 0,
          resolvedTickets: tech.resolved_tickets || tech.resolved_count || 0,
          avgResolutionTime: tech.avg_resolution_time || tech.avg_time || 0,
          slaCompliance: tech.sla_compliance || tech.compliance || 0,
          currentLoad: tech.current_load || tech.active_tickets || 0,
          status: tech.status || 'away'
        }))

        setTechnicianPerformance(techniciansData)
        console.log('✅ Performance dos técnicos carregada:', techniciansData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar performance dos técnicos:', error.response?.data || error.message)
        setTechnicianPerformance([])
      }

      // Buscar tickets com SLA ativo
      try {
        const ticketsEndpoint = selectedTechnicianId
          ? `/sla/tickets?technician_id=${selectedTechnicianId}`
          : '/sla/tickets'
        
        const apiAuth = apiWithAuth(token)
        const ticketsResponse = await apiAuth.get(ticketsEndpoint)
        const ticketsData = ticketsResponse.data || []

        const slaTicketsData: SLATicket[] = ticketsData.map((ticket: any) => {
          const deadline = ticket.sla_deadline || ticket.deadline
          const timeRemaining = deadline ? calculateTimeRemaining(deadline) : 0
          const isOverdue = timeRemaining <= 0

          return {
            id: ticket.id,
            title: ticket.title || 'Sem título',
            priority: ticket.priority || 'medium',
            status: ticket.status || 'open',
            created_at: ticket.created_at || new Date().toISOString(),
            sla_deadline: deadline || new Date().toISOString(),
            technician: ticket.assigned_technician?.full_name || ticket.technician_name || 'Não atribuído',
            timeRemaining,
            isOverdue
          }
        })

        setSlaTickets(slaTicketsData)
        console.log('✅ Tickets com SLA carregados:', slaTicketsData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar tickets com SLA:', error.response?.data || error.message)
        setSlaTickets([])
      }

    } catch (error) {
      console.error('❌ Erro geral ao buscar dados de SLA:', error)
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

  if (loading && !slaMetrics) {
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
    <div className="admin-sla-monitoring" style={{ padding: '2rem' }}>
      <div className="section-header">
        <h2>⏱️ SLA & Produtividade</h2>
        <div className="section-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="technician-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="technician-select" style={{ fontWeight: 'bold' }}>Filtrar por técnico:</label>
            <select
              id="technician-select"
              value={selectedTechnicianId || ''}
              onChange={(e) => setSelectedTechnicianId(e.target.value ? Number(e.target.value) : null)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Todos os técnicos</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="refresh-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">1min</option>
              <option value="300">5min</option>
            </select>
          </div>
          <button 
            onClick={fetchSLAData}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
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
        </div>

        <div className="stat-card">
          <h3>Chamados em SLA</h3>
          <div className="stat-value">{slaMetrics.ticketsInSLA}</div>
          <div className="stat-change">
            ⚠️ {slaMetrics.ticketsOutSLA} fora do SLA
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
                </tr>
            </thead>
            <tbody>
              {slaTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhum ticket com SLA ativo no momento
                  </td>
                </tr>
              ) : (
                slaTickets.map((ticket) => (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas e notificações */}
      <div className="alerts-section">
        <h3>🚨 Alertas de SLA</h3>
        <div className="alerts-grid">
          {slaMetrics.urgentTickets > 0 && (
            <div className="alert-card warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>{slaMetrics.urgentTickets} ticket{slaMetrics.urgentTickets > 1 ? 's' : ''} crítico{slaMetrics.urgentTickets > 1 ? 's' : ''} próximo{slaMetrics.urgentTickets > 1 ? 's' : ''} do vencimento</h4>
                <p>Requerem atenção imediata para manter SLA</p>
              </div>
            </div>
          )}
          {slaMetrics.overallCompliance < 95 && (
            <div className="alert-card info">
              <div className="alert-icon">ℹ️</div>
              <div className="alert-content">
                <h4>Conformidade SLA abaixo da meta</h4>
                <p>Meta: 95% | Atual: {slaMetrics.overallCompliance.toFixed(1)}%</p>
              </div>
            </div>
          )}
          {slaMetrics.ticketsOutSLA > 0 && (
            <div className="alert-card warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>{slaMetrics.ticketsOutSLA} ticket{slaMetrics.ticketsOutSLA > 1 ? 's' : ''} fora do SLA</h4>
                <p>Necessário atenção para melhorar conformidade</p>
              </div>
            </div>
          )}
          {slaMetrics.overallCompliance >= 95 && (
            <div className="alert-card success">
              <div className="alert-icon">✅</div>
              <div className="alert-content">
                <h4>Conformidade SLA dentro da meta</h4>
                <p>Meta: 95% | Atual: {slaMetrics.overallCompliance.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSLAMonitoring

