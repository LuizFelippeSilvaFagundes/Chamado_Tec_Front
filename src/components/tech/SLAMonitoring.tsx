import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { handleApiError } from '../../utils/errorHandler'
import { getSLAMetrics, getSLATickets, getSLATechnicianPerformance } from '../../api/api'
import LoadingSpinner from '../LoadingSpinner'

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
  const { showError: showErrorToast } = useToast()
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null)
  const [technicianPerformance, setTechnicianPerformance] = useState<TechnicianPerformance[]>([])
  const [slaTickets, setSlaTickets] = useState<SLATicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (!token) return
    
    fetchSLAData()
  }, [token])

  useEffect(() => {
    if (!autoRefresh || !token) return
    
    const interval = setInterval(fetchSLAData, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [refreshInterval, autoRefresh, token])

  // Calcular tempo restante até deadline
  const calculateTimeRemaining = (deadline: string): number => {
    const now = new Date().getTime()
    const deadlineTime = new Date(deadline).getTime()
    const diffMs = deadlineTime - now
    return Math.max(0, Math.floor(diffMs / (1000 * 60))) // Retorna em minutos
  }

  const fetchSLAData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!token) {
        const errorMsg = 'Token não disponível. Faça login novamente.'
        showErrorToast(errorMsg)
        setError(errorMsg)
        setLoading(false)
        return
      }

      console.log('⏱️ Buscando dados de SLA da API...')
      
      let hasError = false
      
      // Buscar métricas de SLA
      try {
        const metricsResponse = await getSLAMetrics(token)
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
        hasError = true
        // Se não conseguir buscar métricas, inicializar com valores zerados
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
          status: tech.status || 'away' // online, busy, away
        }))

        setTechnicianPerformance(techniciansData)
        console.log('✅ Performance dos técnicos carregada:', techniciansData)
      } catch (error: any) {
        console.error('❌ Erro ao buscar performance dos técnicos:', error.response?.data || error.message)
        hasError = true
        setTechnicianPerformance([])
      }

      // Buscar tickets com SLA ativo
      try {
        const ticketsResponse = await getSLATickets(token)
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
        hasError = true
        setSlaTickets([])
      }

      // Se houver erro em todas as chamadas, mostrar mensagem
      if (hasError && !slaMetrics && technicianPerformance.length === 0 && slaTickets.length === 0) {
        const errorMessage = 'Erro ao carregar dados de SLA. Alguns dados podem estar indisponíveis.'
        showErrorToast(errorMessage)
        setError(errorMessage)
      }

    } catch (error) {
      console.error('❌ Erro geral ao buscar dados de SLA:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(`Erro ao carregar dados de SLA: ${errorMessage}`)
      setError(errorMessage)
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
    return <LoadingSpinner size="large" message="Carregando monitoramento de SLA..." fullScreen={false} />
  }

  if (!slaMetrics && error) {
    return (
      <div className="error-state" style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        maxWidth: '600px', 
        margin: '2rem auto' 
      }}>
        <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>❌ Erro ao carregar dados de SLA</h3>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{error}</p>
        <button 
          onClick={fetchSLAData}
          style={{ 
            marginTop: '1rem', 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          🔄 Tentar Novamente
        </button>
      </div>
    )
  }

  if (!slaMetrics) {
    return (
      <div className="error-state" style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        maxWidth: '600px', 
        margin: '2rem auto' 
      }}>
        <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>Nenhum dado disponível</h3>
        <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
          Não foi possível carregar as informações de SLA e produtividade.
        </p>
        <button 
          onClick={fetchSLAData}
          style={{ 
            marginTop: '1rem', 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          🔄 Tentar Novamente
        </button>
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

export default SLAMonitoring
