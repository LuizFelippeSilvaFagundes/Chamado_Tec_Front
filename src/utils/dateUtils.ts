/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data para exibição em português brasileiro
 * @param dateString - String da data (ISO ou qualquer formato válido)
 * @param includeTime - Se deve incluir hora (padrão: true)
 * @returns String formatada da data
 */
export const formatDate = (dateString: string, includeTime: boolean = true): string => {
  if (!dateString) {
    return 'Data não disponível'
  }

  try {
    const date = new Date(dateString)
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      console.warn('Data inválida recebida:', dateString)
      return 'Data inválida'
    }

    // Converter para o fuso horário brasileiro (UTC-3)
    const brazilOffset = -3 * 60 // -3 horas em minutos
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const brazilTime = new Date(utc + (brazilOffset * 60000))

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }

    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }

    return brazilTime.toLocaleDateString('pt-BR', options)
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Data original:', dateString)
    return 'Erro na data'
  }
}

/**
 * Formata apenas a data (sem hora)
 * @param dateString - String da data
 * @returns String formatada da data
 */
export const formatDateOnly = (dateString: string): string => {
  return formatDate(dateString, false)
}

/**
 * Formata data e hora completa
 * @param dateString - String da data
 * @returns String formatada da data com hora
 */
export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, true)
}

/**
 * Formata data relativa (ex: "há 2 dias")
 * @param dateString - String da data
 * @returns String com tempo relativo
 */
export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) {
    return 'Data não disponível'
  }

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return 'Hoje'
    } else if (diffInDays === 1) {
      return 'Ontem'
    } else if (diffInDays < 7) {
      return `Há ${diffInDays} dias`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `Há ${weeks} semana${weeks > 1 ? 's' : ''}`
    } else {
      return formatDateOnly(dateString)
    }
  } catch (error) {
    console.error('Erro ao formatar data relativa:', error)
    return formatDateOnly(dateString)
  }
}

/**
 * Verifica se uma data está vencida (passou do prazo)
 * @param dateString - String da data
 * @returns true se a data passou
 */
export const isDateOverdue = (dateString: string): boolean => {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    return date.getTime() < now.getTime()
  } catch (error) {
    console.error('Erro ao verificar data vencida:', error)
    return false
  }
}
