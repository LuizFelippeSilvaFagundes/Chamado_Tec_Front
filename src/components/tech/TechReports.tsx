import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface ReportData {
  period: string
  totalTickets: number
  resolvedTickets: number
  pendingTickets: number
  avgResolutionTime: number
  slaCompliance: number
  topCategories: Array<{ category: string; count: number }>
  topTechnicians: Array<{ name: string; tickets: number; avgTime: number }>
  equipmentStats: Array<{ equipment: string; issues: number }>
  monthlyTrend: Array<{ month: string; tickets: number; resolved: number }>
}

function TechReports() {
  const { token } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [reportType, setReportType] = useState<'overview' | 'detailed' | 'export'>('overview')

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      // Simulação de dados - substituir pela chamada real da API
      const mockData: ReportData = {
        period: selectedPeriod,
        totalTickets: 156,
        resolvedTickets: 142,
        pendingTickets: 14,
        avgResolutionTime: 2.5,
        slaCompliance: 94.2,
        topCategories: [
          { category: 'Hardware', count: 45 },
          { category: 'Software', count: 38 },
          { category: 'Rede', count: 28 },
          { category: 'Impressoras', count: 25 },
          { category: 'Outros', count: 20 }
        ],
        topTechnicians: [
          { name: 'João Silva', tickets: 45, avgTime: 2.1 },
          { name: 'Maria Santos', tickets: 38, avgTime: 2.8 },
          { name: 'Pedro Costa', tickets: 32, avgTime: 2.3 },
          { name: 'Ana Oliveira', tickets: 28, avgTime: 2.6 }
        ],
        equipmentStats: [
          { equipment: 'PC-001', issues: 8 },
          { equipment: 'PRINT-002', issues: 6 },
          { equipment: 'PC-003', issues: 5 },
          { equipment: 'NET-001', issues: 4 }
        ],
        monthlyTrend: [
          { month: 'Jan', tickets: 45, resolved: 42 },
          { month: 'Fev', tickets: 52, resolved: 48 },
          { month: 'Mar', tickets: 38, resolved: 35 },
          { month: 'Abr', tickets: 41, resolved: 38 },
          { month: 'Mai', tickets: 49, resolved: 46 },
          { month: 'Jun', tickets: 56, resolved: 52 }
        ]
      }
      setReportData(mockData)
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!reportData) return
    
    const csvContent = generateCSV(reportData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_tecnico_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateCSV = (data: ReportData) => {
    let csv = 'Relatório Técnico - Período: ' + data.period + ' dias\n\n'
    csv += 'Métricas Gerais\n'
    csv += 'Total de Chamados,' + data.totalTickets + '\n'
    csv += 'Chamados Resolvidos,' + data.resolvedTickets + '\n'
    csv += 'Chamados Pendentes,' + data.pendingTickets + '\n'
    csv += 'Tempo Médio de Resolução (horas),' + data.avgResolutionTime + '\n'
    csv += 'Conformidade SLA (%),' + data.slaCompliance + '\n\n'
    
    csv += 'Top Categorias\n'
    csv += 'Categoria,Quantidade\n'
    data.topCategories.forEach(item => {
      csv += item.category + ',' + item.count + '\n'
    })
    
    return csv
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Gerando relatórios...</p>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="error-state">
        <h3>Erro ao carregar relatórios</h3>
        <p>Não foi possível carregar os dados do relatório.</p>
      </div>
    )
  }

  return (
    <div className="tech-reports">
      <div className="section-header">
        <h2>📊 Relatórios e Dashboards</h2>
        <div className="section-actions">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="filter-select"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <button className="action-btn primary" onClick={fetchReportData}>
            🔄 Atualizar
          </button>
          <button className="action-btn success" onClick={exportReport}>
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Chamados</h3>
          <div className="stat-value">{reportData.totalTickets}</div>
          <div className="stat-change positive">
            📈 +12% vs período anterior
          </div>
        </div>
        <div className="stat-card">
          <h3>Taxa de Resolução</h3>
          <div className="stat-value">{formatPercentage((reportData.resolvedTickets / reportData.totalTickets) * 100)}</div>
          <div className="stat-change positive">
            ✅ {reportData.resolvedTickets} resolvidos
          </div>
        </div>
        <div className="stat-card">
          <h3>Tempo Médio</h3>
          <div className="stat-value">{formatHours(reportData.avgResolutionTime)}</div>
          <div className="stat-change positive">
            ⏱️ Melhorou 15%
          </div>
        </div>
        <div className="stat-card">
          <h3>Conformidade SLA</h3>
          <div className="stat-value">{formatPercentage(reportData.slaCompliance)}</div>
          <div className="stat-change positive">
            🎯 Meta: 95%
          </div>
        </div>
      </div>

      {/* Gráficos e tabelas */}
      <div className="reports-grid">
        {/* Top categorias */}
        <div className="report-card">
          <h3>📈 Top Categorias de Problemas</h3>
          <div className="chart-container">
            <div className="bar-chart">
              {reportData.topCategories.map((item, index) => (
                <div key={item.category} className="bar-item">
                  <div className="bar-label">{item.category}</div>
                  <div className="bar-wrapper">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${(item.count / reportData.topCategories[0].count) * 100}%`,
                        backgroundColor: `hsl(${200 + index * 40}, 70%, 50%)`
                      }}
                    ></div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top técnicos */}
        <div className="report-card">
          <h3>👥 Performance dos Técnicos</h3>
          <div className="table-container">
            <table className="tech-table">
              <thead>
                <tr>
                  <th>Técnico</th>
                  <th>Chamados</th>
                  <th>Tempo Médio</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topTechnicians.map((tech, index) => (
                  <tr key={tech.name}>
                    <td>{tech.name}</td>
                    <td>{tech.tickets}</td>
                    <td>{formatHours(tech.avgTime)}</td>
                    <td>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ 
                            width: `${(tech.tickets / reportData.topTechnicians[0].tickets) * 100}%`,
                            backgroundColor: index === 0 ? '#10b981' : '#667eea'
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipamentos com mais problemas */}
        <div className="report-card">
          <h3>🖥️ Equipamentos com Mais Problemas</h3>
          <div className="equipment-list">
            {reportData.equipmentStats.map((equipment, index) => (
              <div key={equipment.equipment} className="equipment-item">
                <div className="equipment-info">
                  <span className="equipment-id">{equipment.equipment}</span>
                  <span className="issues-count">{equipment.issues} problemas</span>
                </div>
                <div className="issues-bar">
                  <div 
                    className="issues-fill"
                    style={{ 
                      width: `${(equipment.issues / reportData.equipmentStats[0].issues) * 100}%`,
                      backgroundColor: equipment.issues > 6 ? '#ef4444' : equipment.issues > 4 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendência mensal */}
        <div className="report-card">
          <h3>📅 Tendência Mensal</h3>
          <div className="chart-container">
            <div className="line-chart">
              {reportData.monthlyTrend.map((month, index) => (
                <div key={month.month} className="chart-point">
                  <div className="point-info">
                    <span className="month-label">{month.month}</span>
                    <span className="tickets-count">{month.tickets}</span>
                  </div>
                  <div 
                    className="chart-bar"
                    style={{ 
                      height: `${(month.tickets / Math.max(...reportData.monthlyTrend.map(m => m.tickets))) * 100}%`,
                      backgroundColor: '#667eea'
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo executivo */}
      <div className="executive-summary">
        <h3>📋 Resumo Executivo</h3>
        <div className="summary-content">
          <div className="summary-item">
            <h4>✅ Pontos Positivos</h4>
            <ul>
              <li>Alta taxa de conformidade com SLA ({formatPercentage(reportData.slaCompliance)})</li>
              <li>Tempo médio de resolução dentro do esperado ({formatHours(reportData.avgResolutionTime)})</li>
              <li>Equipe técnica produtiva com {reportData.resolvedTickets} chamados resolvidos</li>
            </ul>
          </div>
          <div className="summary-item">
            <h4>⚠️ Áreas de Atenção</h4>
            <ul>
              <li>{reportData.pendingTickets} chamados pendentes requerem atenção</li>
              <li>Categoria "Hardware" representa {Math.round((reportData.topCategories[0].count / reportData.totalTickets) * 100)}% dos problemas</li>
              <li>Equipamento PC-001 com {reportData.equipmentStats[0].issues} problemas recorrentes</li>
            </ul>
          </div>
          <div className="summary-item">
            <h4>🎯 Recomendações</h4>
            <ul>
              <li>Implementar manutenção preventiva para equipamentos críticos</li>
              <li>Revisar procedimentos de diagnóstico de hardware</li>
              <li>Considerar treinamento adicional para técnicos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechReports
