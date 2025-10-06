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

export const uploadAvatar = async (token: string, file: File) => {
  const apiAuth = apiWithAuth(token);
  const form = new FormData();
  form.append('file', file);
  return await apiAuth.post('/users/profile/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};