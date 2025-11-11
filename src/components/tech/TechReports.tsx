import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getResolvedTickets, getAdminAssignedTickets, getAssignedTickets } from '../../api/api'

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

  useEffect(() => {
    if (token) {
      fetchReportData()
    }
  }, [selectedPeriod, token])

  // Calcular tempo de resolução em horas
  const calculateResolutionTime = (createdAt: string, resolvedAt?: string): number => {
    if (!resolvedAt) return 0
    const created = new Date(createdAt).getTime()
    const resolved = new Date(resolvedAt).getTime()
    const diffMs = resolved - created
    return Math.max(0, diffMs / (1000 * 60 * 60)) // Retorna em horas
  }

  // Verificar se está dentro do período
  const isWithinPeriod = (dateString: string, periodDays: number): boolean => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays <= periodDays
  }

  // Agrupar por mês
  const getMonthName = (dateString: string): string => {
    const date = new Date(dateString)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return months[date.getMonth()]
  }

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        console.error('❌ Token não disponível')
        setReportData(null)
        return
      }

      console.log('📊 Buscando dados de relatórios dos tickets do técnico...')
      
      const periodDays = parseInt(selectedPeriod)
      
      // Buscar todos os tickets do técnico (resolvidos e atribuídos)
      let allTickets: any[] = []
      
      try {
        // Tentar buscar tickets resolvidos
        let resolvedTickets: any[] = []
        try {
          const resolvedResponse = await getResolvedTickets(token)
          resolvedTickets = resolvedResponse.data || []
          console.log('✅ Tickets resolvidos (endpoint específico):', resolvedTickets.length)
        } catch (resolvedError: any) {
          console.warn('⚠️ Endpoint /tech/tickets/resolved não disponível, tentando alternativa...')
          // Alternativa: buscar todos os tickets atribuídos e filtrar por status
          try {
            const allAssignedResponse = await getAssignedTickets(token)
            const allAssigned = allAssignedResponse.data || []
            resolvedTickets = allAssigned.filter((t: any) => 
              t.status === 'resolved' || t.status === 'closed'
            )
            console.log('✅ Tickets resolvidos (filtrados):', resolvedTickets.length)
          } catch (altError: any) {
            console.warn('⚠️ Erro ao buscar tickets resolvidos:', altError.message)
            resolvedTickets = []
          }
        }
        
        // Tentar buscar tickets atribuídos pelo admin
        let assignedTickets: any[] = []
        try {
          const assignedResponse = await getAdminAssignedTickets(token)
          assignedTickets = assignedResponse.data || []
          console.log('✅ Tickets atribuídos pelo admin:', assignedTickets.length)
        } catch (assignedError: any) {
          console.warn('⚠️ Endpoint /tech/tickets/admin-assigned não disponível, tentando alternativa...')
          // Alternativa: buscar todos os tickets atribuídos
          try {
            const allAssignedResponse = await getAssignedTickets(token)
            assignedTickets = allAssignedResponse.data || []
            console.log('✅ Tickets atribuídos (alternativa):', assignedTickets.length)
          } catch (altError: any) {
            console.warn('⚠️ Erro ao buscar tickets atribuídos:', altError.message)
            assignedTickets = []
          }
        }
        
        // Combinar todos os tickets
        allTickets = [...resolvedTickets, ...assignedTickets]
        
        // Remover duplicatas (mesmo ticket pode aparecer nos dois)
        const uniqueTickets = allTickets.filter((ticket, index, self) => 
          index === self.findIndex(t => t.id === ticket.id)
        )
        
        // Filtrar por período
        const filteredTickets = uniqueTickets.filter((ticket: any) => 
          isWithinPeriod(ticket.created_at || ticket.createdAt, periodDays)
        )
        
        console.log(`📋 Total de tickets no período de ${periodDays} dias:`, filteredTickets.length)
        
        // Calcular estatísticas
        const resolved = filteredTickets.filter((t: any) => 
          t.status === 'resolved' || t.status === 'closed'
        )
        
        const pending = filteredTickets.filter((t: any) => 
          t.status === 'open' || t.status === 'pending' || t.status === 'in-progress'
        )
        
        // Calcular tempo médio de resolução
        const resolutionTimes = resolved
          .map((t: any) => calculateResolutionTime(t.created_at, t.resolved_at || t.closed_at))
          .filter((time: number) => time > 0)
        
        const avgResolutionTime = resolutionTimes.length > 0
          ? resolutionTimes.reduce((a: number, b: number) => a + b, 0) / resolutionTimes.length
          : 0
        
        // Calcular SLA compliance (tickets resolvidos dentro do prazo)
        const ticketsInSLA = resolved.filter((t: any) => {
          if (!t.sla_deadline) return false
          const resolvedAt = t.resolved_at || t.closed_at
          if (!resolvedAt) return false
          return new Date(resolvedAt) <= new Date(t.sla_deadline)
        })
        
        const slaCompliance = resolved.length > 0
          ? (ticketsInSLA.length / resolved.length) * 100
          : 0
        
        // Agrupar por categoria
        const categoryMap = new Map<string, number>()
        filteredTickets.forEach((ticket: any) => {
          const category = ticket.problem_type || ticket.category || 'Outros'
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
        })
        
        const topCategories = Array.from(categoryMap.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        // Agrupar por equipamento
        const equipmentMap = new Map<string, number>()
        filteredTickets.forEach((ticket: any) => {
          if (ticket.equipment_id) {
            equipmentMap.set(ticket.equipment_id, (equipmentMap.get(ticket.equipment_id) || 0) + 1)
          }
        })
        
        const equipmentStats = Array.from(equipmentMap.entries())
          .map(([equipment, issues]) => ({ equipment, issues }))
          .sort((a, b) => b.issues - a.issues)
          .slice(0, 10)
        
        // Agrupar por mês (tendências)
        const monthMap = new Map<string, { tickets: number, resolved: number }>()
        filteredTickets.forEach((ticket: any) => {
          const month = getMonthName(ticket.created_at)
          const current = monthMap.get(month) || { tickets: 0, resolved: 0 }
          current.tickets++
          if (ticket.status === 'resolved' || ticket.status === 'closed') {
            current.resolved++
          }
          monthMap.set(month, current)
        })
        
        const monthlyTrend = Array.from(monthMap.entries())
          .map(([month, data]) => ({ month, tickets: data.tickets, resolved: data.resolved }))
          .sort((a, b) => {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            return months.indexOf(a.month) - months.indexOf(b.month)
          })
        
        // Montar estrutura de dados
        const reportData: ReportData = {
          period: selectedPeriod,
          totalTickets: filteredTickets.length,
          resolvedTickets: resolved.length,
          pendingTickets: pending.length,
          avgResolutionTime: Math.round(avgResolutionTime * 10) / 10, // Arredondar para 1 casa decimal
          slaCompliance: Math.round(slaCompliance * 10) / 10,
          topCategories,
          topTechnicians: [], // Para técnico individual, não há outros técnicos
          equipmentStats,
          monthlyTrend
        }

        console.log('✅ Dados de relatórios calculados:', reportData)
        setReportData(reportData)
        
      } catch (error: any) {
        console.error('❌ Erro ao buscar tickets:', error.response?.data || error.message)
        console.error('❌ Stack trace:', error.stack)
        
        // Tentar apenas com tickets atribuídos (que inclui resolvidos)
        try {
          console.log('🔄 Tentando buscar tickets atribuídos (fallback)...')
          const assignedResponse = await getAssignedTickets(token)
          const allTickets = assignedResponse.data || []
          console.log('✅ Tickets atribuídos recebidos:', allTickets.length)
          
          // Filtrar apenas os resolvidos
          const resolvedTickets = allTickets.filter((t: any) => 
            t.status === 'resolved' || t.status === 'closed'
          )
          console.log('✅ Tickets resolvidos (filtrados):', resolvedTickets.length)
          
          if (resolvedTickets.length === 0) {
            console.warn('⚠️ Nenhum ticket resolvido encontrado')
            // Criar relatório vazio mas válido
            const reportData: ReportData = {
              period: selectedPeriod,
              totalTickets: 0,
              resolvedTickets: 0,
              pendingTickets: 0,
              avgResolutionTime: 0,
              slaCompliance: 0,
              topCategories: [],
              topTechnicians: [],
              equipmentStats: [],
              monthlyTrend: []
            }
            setReportData(reportData)
            return
          }
          
          const periodDays = parseInt(selectedPeriod)
          const filteredTickets = resolvedTickets.filter((ticket: any) => 
            isWithinPeriod(ticket.created_at || ticket.createdAt, periodDays)
          )
          
          console.log(`📋 Tickets filtrados para período de ${periodDays} dias:`, filteredTickets.length)
          
          // Calcular estatísticas básicas
          const categoryMap = new Map<string, number>()
          filteredTickets.forEach((ticket: any) => {
            const category = ticket.problem_type || ticket.category || 'Outros'
            categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
          })
          
          const topCategories = Array.from(categoryMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
          
          const reportData: ReportData = {
            period: selectedPeriod,
            totalTickets: filteredTickets.length,
            resolvedTickets: filteredTickets.length,
            pendingTickets: 0,
            avgResolutionTime: 0,
            slaCompliance: 0,
            topCategories,
            topTechnicians: [],
            equipmentStats: [],
            monthlyTrend: []
          }
          
          console.log('✅ Relatório criado com dados básicos:', reportData)
          setReportData(reportData)
        } catch (fallbackError: any) {
          console.error('❌ Erro ao buscar tickets resolvidos:', fallbackError.response?.data || fallbackError.message)
          console.error('❌ Stack trace:', fallbackError.stack)
          setReportData(null)
        }
      }
      
    } catch (error: any) {
      console.error('❌ Erro geral ao buscar dados de relatórios:', error.response?.data || error.message)
      setReportData(null)
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
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
          Verifique o console do navegador para mais detalhes sobre o erro.
        </p>
        <button 
          onClick={fetchReportData}
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          🔄 Tentar Novamente
        </button>
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
            <div className="stat-value">{reportData.totalTickets > 0 ? formatPercentage((reportData.resolvedTickets / reportData.totalTickets) * 100) : '0%'}</div>
            <div className="stat-change positive">
              ✅ {reportData.resolvedTickets} resolvidos
            </div>
          </div>
        <div className="stat-card">
          <h3>Tempo Médio</h3>
          <div className="stat-value">{formatHours(reportData.avgResolutionTime)}</div>
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
              {reportData.topCategories.length > 0 ? reportData.topCategories.map((item, idx) => (
                <div key={item.category} className="bar-item">
                  <div className="bar-label">{item.category}</div>
                  <div className="bar-wrapper">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: reportData.topCategories[0].count > 0
                          ? `${(item.count / reportData.topCategories[0].count) * 100}%`
                          : '0%',
                        backgroundColor: `hsl(${200 + idx * 40}, 70%, 50%)`
                      }}
                    ></div>
                    <span className="bar-value">{item.count}</span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  Nenhuma categoria encontrada no período selecionado
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top técnicos - Removido pois é relatório individual do técnico */}

        {/* Equipamentos com mais problemas */}
        <div className="report-card">
          <h3>🖥️ Equipamentos com Mais Problemas</h3>
          <div className="equipment-list">
            {reportData.equipmentStats.length > 0 ? reportData.equipmentStats.map((equipment) => (
              <div key={equipment.equipment} className="equipment-item">
                <div className="equipment-info">
                  <span className="equipment-id">{equipment.equipment}</span>
                  <span className="issues-count">{equipment.issues} problema{equipment.issues > 1 ? 's' : ''}</span>
                </div>
                <div className="issues-bar">
                  <div 
                    className="issues-fill"
                    style={{ 
                      width: reportData.equipmentStats.length > 0 && reportData.equipmentStats[0].issues > 0
                        ? `${(equipment.issues / reportData.equipmentStats[0].issues) * 100}%`
                        : '0%',
                      backgroundColor: equipment.issues > 6 ? '#ef4444' : equipment.issues > 4 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                Nenhum equipamento encontrado no período selecionado
              </div>
            )}
          </div>
        </div>

        {/* Tendência mensal */}
        <div className="report-card">
          <h3>📅 Tendência Mensal</h3>
          <div className="chart-container">
            <div className="line-chart">
              {reportData.monthlyTrend.length > 0 ? reportData.monthlyTrend.map((month) => {
                const maxTickets = Math.max(...reportData.monthlyTrend.map(m => m.tickets))
                return (
                  <div key={month.month} className="chart-point">
                    <div className="point-info">
                      <span className="month-label">{month.month}</span>
                      <span className="tickets-count">{month.tickets}</span>
                    </div>
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: maxTickets > 0
                          ? `${(month.tickets / maxTickets) * 100}%`
                          : '0%',
                        backgroundColor: '#667eea'
                      }}
                    ></div>
                  </div>
                )
              }) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  Nenhuma tendência encontrada no período selecionado
                </div>
              )}
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
              {reportData.topCategories.length > 0 && reportData.totalTickets > 0 && (
                <li>Categoria "{reportData.topCategories[0].category}" representa {Math.round((reportData.topCategories[0].count / reportData.totalTickets) * 100)}% dos problemas</li>
              )}
              {reportData.equipmentStats.length > 0 && (
                <li>Equipamento {reportData.equipmentStats[0].equipment} com {reportData.equipmentStats[0].issues} problemas recorrentes</li>
              )}
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
