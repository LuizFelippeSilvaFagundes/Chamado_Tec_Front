import axios from "axios";

// API base sem autenticação
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// API com token de autenticação
export const apiWithAuth = (token: string) => {
  return axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Tipos de dados
interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

interface TechRegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  employee_id: string;
  department: string;
  specialty: string[];
  phone: string;
  emergency_contact?: string;
  certifications?: string;
  experience_years?: string;
  availability: 'full-time' | 'part-time' | 'on-call';
  notes?: string;
  role: 'technician';
  is_active: boolean;
}

interface AdminRegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

interface LoginData {
  username: string;
  password: string;
}

// Função para registrar usuário comum
export const registerUser = async (data: RegisterData) => {
  return await api.post("/register", data);
};

// Função para registrar técnico
export const registerTechnician = async (data: TechRegisterData) => {
  return await api.post("/register-technician", data);
};

// Função para registrar administrador
export const registerAdmin = async (data: AdminRegisterData) => {
  return await api.post("/admin-register", data);
};

// Função para login de usuário
export const loginUser = async (data: LoginData) => {
  return await api.post("/login", data);
};

// === NOVAS FUNÇÕES PARA TÉCNICOS ===

// Buscar tickets disponíveis para técnicos (atribuídos + não atribuídos)
export const getTechTickets = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get("/tech/tickets");
};

// Buscar apenas tickets atribuídos ao técnico
export const getAssignedTickets = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get("/tech/tickets/assigned");
};

// Buscar tickets resolvidos pelo técnico logado
export const getResolvedTickets = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get("/tech/tickets/resolved");
};

// Buscar tickets atribuídos pelo admin ao técnico logado
export const getAdminAssignedTickets = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get("/tech/tickets/admin-assigned");
};

// Buscar apenas tickets disponíveis para pegar
export const getAvailableTickets = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get("/tech/tickets/available");
};

// Pegar um ticket não atribuído
export const takeTicket = async (token: string, ticketId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/tech/tickets/${ticketId}/take`);
};

// Atualizar status do ticket
export const updateTicketStatus = async (token: string, ticketId: number, status: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.put(`/tech/tickets/${ticketId}/status`, { status });
};

// Atualizar ticket completo (admin)
export const updateTicket = async (
  token: string, 
  ticketId: number, 
  data: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    problem_type?: string;
    status?: string;
  }
) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.put(`/admin/tickets/${ticketId}`, data);
};

// Perfil do usuário (frontend)
export const getProfile = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/users/profile');
};

export const updateProfile = async (token: string, data: Partial<{ full_name: string; email: string; phone?: string }>) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.put('/users/profile', data);
};

export const changePassword = async (token: string, current_password: string, new_password: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post('/users/change-password', { current_password, new_password });
};

// === AVATAR FUNCTIONS ===
export const uploadAvatar = async (token: string, file: File) => {
  const apiAuth = apiWithAuth(token);
  const form = new FormData();
  form.append('file', file);
  return await apiAuth.post('/avatars/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const getMyAvatar = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/avatars/me');
};

export const deleteMyAvatar = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.delete('/avatars/me');
};

// === TICKET ATTACHMENTS FUNCTIONS ===

export const uploadTicketAttachments = async (token: string, ticketId: number, files: File[]) => {
  const apiAuth = apiWithAuth(token);
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  return await apiAuth.post(`/tickets/${ticketId}/attachments/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getTicketAttachments = async (token: string, ticketId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/tickets/${ticketId}/attachments/`);
};

export const downloadTicketAttachment = (ticketId: number, filename: string) => {
  // Download direto via URL
  const url = `http://127.0.0.1:8000/tickets/${ticketId}/attachments/download/${filename}`;
  window.open(url, '_blank');
};

export const deleteTicketAttachment = async (token: string, ticketId: number, filename: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.delete(`/tickets/${ticketId}/attachments/${filename}`);
};

// === FUNÇÕES PARA LISTAR USUÁRIOS POR ROLE ===

// Listar apenas servidores
export const getServidoresTodos = async () => {
  return await api.get("/servidores/todos");
};

// Listar apenas técnicos
export const getTecnicosTodos = async () => {
  return await api.get("/tech/todos");
};

// Listar apenas administradores
export const getAdminsTodos = async () => {
  return await api.get("/admin/todos");
};

// === FUNÇÕES PARA COMENTÁRIOS/HISTÓRICO DE TICKETS ===

// Buscar comentários/histórico de um ticket
export const getTicketComments = async (token: string, ticketId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/tickets/${ticketId}/comments`);
};

// Buscar histórico completo de um ticket
export const getTicketHistory = async (token: string, ticketId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/tickets/${ticketId}/history`);
};

// === FUNÇÕES PARA RELATÓRIOS ===

// Buscar relatório geral/overview
export const getReportsOverview = async (token: string, period: string = '30') => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/reports/overview?period=${period}`);
};

// Buscar relatório detalhado
export const getReportsDetailed = async (token: string, period: string = '30') => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/reports/detailed?period=${period}`);
};

// Buscar estatísticas por categoria
export const getReportsCategories = async (token: string, period: string = '30') => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/reports/categories?period=${period}`);
};

// Buscar performance dos técnicos
export const getReportsTechnicians = async (token: string, period: string = '30') => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/reports/technicians?period=${period}`);
};

// Buscar estatísticas de equipamentos
export const getReportsEquipment = async (token: string, period: string = '30') => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/reports/equipment?period=${period}`);
};

// Buscar tendências mensais
export const getReportsTrends = async (token: string, period: string = '30') => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/reports/trends?period=${period}`);
};

// === FUNÇÕES PARA SLA & MONITORAMENTO ===

// Buscar métricas de SLA
export const getSLAMetrics = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/sla/metrics');
};

// Buscar tickets com SLA ativo
export const getSLATickets = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/sla/tickets');
};

// Buscar performance dos técnicos para SLA
export const getSLATechnicianPerformance = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/sla/technicians/performance');
};

// Buscar alertas de SLA
export const getSLAAlerts = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/sla/alerts');
};

// === FUNÇÕES PARA SISTEMA DE APROVAÇÃO ===

// Buscar tickets pendentes de aprovação
export const getApprovalTickets = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/approvals/pending');
};

// Aprovar solicitação
export const approveTicketRequest = async (token: string, approvalId: number, reason: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/approvals/${approvalId}/approve`, { reason });
};

// Rejeitar solicitação
export const rejectTicketRequest = async (token: string, approvalId: number, reason: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/approvals/${approvalId}/reject`, { reason });
};

// Reatribuir chamado
export const reassignTicket = async (token: string, ticketId: number, technicianId: number, reason?: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/approvals/${ticketId}/reassign`, { technician_id: technicianId, reason });
};

// === FUNÇÕES PARA APROVAÇÃO DE TÉCNICOS ===

// Buscar técnicos pendentes de aprovação
export const getPendingTechnicians = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/admin/technicians/pending');
};

// Aprovar técnico
export const approveTechnician = async (token: string, technicianId: number, reason: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/admin/technicians/${technicianId}/approve`, { reason });
};

// Rejeitar técnico
export const rejectTechnician = async (token: string, technicianId: number, reason: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/admin/technicians/${technicianId}/reject`, { reason });
};

// === FUNÇÕES PARA HISTÓRICO DE EQUIPAMENTOS ===

// Buscar todos os equipamentos
export const getEquipments = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/equipment');
};

// Buscar histórico de um equipamento
export const getEquipmentHistory = async (token: string, equipmentId: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/equipment/${equipmentId}/history`);
};

// Buscar tickets relacionados a um equipamento
export const getEquipmentTickets = async (token: string, equipmentId: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/equipment/${equipmentId}/tickets`);
};

// === FUNÇÕES PARA NOTIFICAÇÕES ===

// Buscar notificações
export const getNotifications = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/notifications');
};

// Marcar notificação como lida
export const markNotificationAsRead = async (token: string, notificationId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.put(`/notifications/${notificationId}/read`);
};

// Marcar todas as notificações como lidas
export const markAllNotificationsAsRead = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.put('/notifications/read-all');
};

// Deletar notificação
export const deleteNotification = async (token: string, notificationId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.delete(`/notifications/${notificationId}`);
};

// Limpar todas as notificações
export const clearAllNotifications = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.delete('/notifications');
};

// === FUNÇÕES PARA BASE DE CONHECIMENTO ===

// Buscar todos os artigos
export const getKnowledgeArticles = async (token: string) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get('/knowledge-base/articles');
};

// Buscar artigo por ID
export const getKnowledgeArticle = async (token: string, articleId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.get(`/knowledge-base/articles/${articleId}`);
};

// Criar novo artigo
export const createKnowledgeArticle = async (
  token: string,
  data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    is_published: boolean;
  }
) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post('/knowledge-base/articles', data);
};

// Atualizar artigo
export const updateKnowledgeArticle = async (
  token: string,
  articleId: number,
  data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    is_published: boolean;
  }
) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.put(`/knowledge-base/articles/${articleId}`, data);
};

// Deletar artigo
export const deleteKnowledgeArticle = async (token: string, articleId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.delete(`/knowledge-base/articles/${articleId}`);
};

// Incrementar visualizações
export const incrementArticleViews = async (token: string, articleId: number) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/knowledge-base/articles/${articleId}/view`);
};

// Enviar feedback (útil/não útil)
export const submitArticleFeedback = async (
  token: string,
  articleId: number,
  helpful: boolean
) => {
  const apiAuth = apiWithAuth(token);
  return await apiAuth.post(`/knowledge-base/articles/${articleId}/feedback`, { helpful });
};