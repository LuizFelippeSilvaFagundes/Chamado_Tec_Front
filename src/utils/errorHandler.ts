import { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

/**
 * Trata erros da API e retorna uma mensagem amigável
 */
export const handleApiError = (error: unknown): string => {
  // Erro de rede (sem resposta) - verificar diferentes tipos de erro de conexão
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase()
    
    // Erro de conexão recusada (backend não está rodando)
    if (errorMsg.includes('failed to fetch') || 
        errorMsg.includes('connection_refused') ||
        errorMsg.includes('err_connection_refused') ||
        errorMsg.includes('network error')) {
      return 'Servidor não está respondendo. Verifique sua conexão com a internet.'
    }
    
    // Outros erros de rede
    if (errorMsg.includes('network') || errorMsg.includes('connection') || errorMsg.includes('timeout')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    }
  }

  // Erro do Axios
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<any>
    const status = axiosError.response?.status
    const data = axiosError.response?.data

    // Erro 401 - Não autorizado
    if (status === 401) {
      return 'Sua sessão expirou. Faça login novamente.'
    }

    // Erro 403 - Proibido
    if (status === 403) {
      return 'Você não tem permissão para realizar esta ação.'
    }

    // Erro 404 - Não encontrado
    if (status === 404) {
      return 'Recurso não encontrado.'
    }

    // Erro 422 - Validação
    if (status === 422) {
      if (data?.detail) {
        if (Array.isArray(data.detail)) {
          return data.detail
            .map((d: any) => d?.msg || d?.detail || JSON.stringify(d))
            .join(' | ')
        }
        if (typeof data.detail === 'string') {
          return data.detail
        }
      }
      return 'Dados inválidos. Verifique os campos e tente novamente.'
    }

    // Erro 500 - Servidor
    if (status === 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.'
    }

    // Erro 503 - Serviço indisponível
    if (status === 503) {
      return 'Serviço temporariamente indisponível. Tente novamente mais tarde.'
    }

    // Outros erros HTTP
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        return data.detail
      }
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((d: any) => d?.msg || d?.detail || JSON.stringify(d))
          .join(' | ')
      }
    }

    if (data?.message) {
      return data.message
    }

    return `Erro ${status || 'desconhecido'}. Tente novamente.`
  }

  // Se for um objeto com detail (resposta da API)
  if (error && typeof error === 'object' && 'detail' in error) {
    const apiError = error as { detail?: any }
    if (typeof apiError.detail === 'string') {
      return apiError.detail
    }
    if (Array.isArray(apiError.detail)) {
      return apiError.detail
        .map((d: any) => d?.msg || d?.detail || JSON.stringify(d))
        .join(' | ')
    }
  }

  // Verificar se é um erro de TypeError (fetch failed)
  if (error instanceof TypeError) {
    const errorMsg = error.message.toLowerCase()
    if (errorMsg.includes('failed to fetch') || errorMsg.includes('network')) {
      return 'Servidor não está respondendo. Verifique sua conexão com a internet.'
    }
  }

  // Erro desconhecido
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

/**
 * Retorna true se o erro é de rede (deve tentar novamente)
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase()
    if (errorMsg.includes('network') || 
        errorMsg.includes('fetch') || 
        errorMsg.includes('connection') ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('failed to fetch') ||
        errorMsg.includes('connection_refused')) {
      return true
    }
  }

  // Verificar se é um TypeError de fetch
  if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
    return true
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status

    // Erros temporários que podem ser resolvidos com retry
    return status === 503 || status === 504 || status === 408
  }

  return false
}

/**
 * Retorna true se o erro é de autenticação (deve fazer login novamente)
 */
export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError
    return axiosError.response?.status === 401 || axiosError.response?.status === 403
  }

  return false
}

/**
 * Retorna o número de status HTTP do erro, se disponível
 */
export const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError
    return axiosError.response?.status
  }

  return undefined
}

