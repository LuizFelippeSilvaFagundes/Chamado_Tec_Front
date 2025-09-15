# Sistema de Cadastro de Técnicos

## Visão Geral

O sistema agora possui um processo de cadastro diferenciado para técnicos, que requer aprovação administrativa antes de poder acessar o dashboard técnico.

## Fluxo de Cadastro

### 1. 📝 Solicitação de Cadastro
- **URL**: `/tech-register`
- **Acesso**: Público (link disponível na página de login)
- **Processo**: Técnico preenche formulário completo com informações profissionais

### 2. ⏳ Aguardando Aprovação
- Status inicial: `is_active: false`
- Técnico não consegue fazer login até ser aprovado
- Recebe confirmação de que a solicitação foi enviada

### 3. 👥 Aprovação Administrativa
- **Acesso**: Apenas para usuários com role `admin`
- **Localização**: Dashboard técnico → "Aprovar Técnicos"
- **Processo**: Admin analisa dados e aprova/rejeita

### 4. ✅ Acesso Liberado
- Status alterado para: `is_active: true`
- Técnico pode fazer login normalmente
- Redirecionado automaticamente para `/tech-dashboard`

## Formulário de Cadastro de Técnico

### Informações Obrigatórias
- **Pessoais**: Nome de usuário, e-mail, senha, nome completo, ID funcionário, telefone
- **Profissionais**: Departamento, especialidades (mínimo 1), disponibilidade
- **Contato**: Telefone de emergência (opcional)

### Informações Opcionais
- **Experiência**: Anos de experiência
- **Certificações**: Lista de certificações técnicas
- **Observações**: Informações adicionais relevantes

### Validações
- Senha mínima de 6 caracteres
- Confirmação de senha obrigatória
- Pelo menos uma especialidade deve ser selecionada
- E-mail único no sistema
- Nome de usuário único no sistema

## Especialidades Disponíveis
- Hardware
- Software
- Rede
- Servidores
- Impressoras
- Telefonia
- Segurança
- Backup
- Virtualização
- Cloud Computing

## Departamentos Disponíveis
- TI - Administração
- TI - Suporte
- TI - Infraestrutura
- TI - Desenvolvimento
- TI - Segurança
- TI - Redes

## Tipos de Disponibilidade
- **Tempo Integral**: Trabalho em horário comercial
- **Meio Período**: Trabalho parcial
- **Plantão**: Disponibilidade sob demanda

## Interface de Aprovação (Admin)

### Funcionalidades
- Visualizar todas as solicitações pendentes
- Analisar informações completas do técnico
- Aprovar ou rejeitar com justificativa
- Visualizar histórico de aprovações

### Informações Exibidas
- Dados pessoais completos
- Informações profissionais detalhadas
- Certificações e experiência
- Data da solicitação
- Status atual

### Ações Disponíveis
- ✅ **Aprovar**: Libera acesso ao sistema
- ❌ **Rejeitar**: Nega o acesso (com motivo)
- 📧 **Notificar**: Envia e-mail de confirmação

## Segurança e Controle

### Controle de Acesso
- Apenas admins podem aprovar técnicos
- Técnicos aprovados têm acesso ao dashboard técnico
- Técnicos não aprovados não conseguem fazer login

### Auditoria
- Todas as ações de aprovação são registradas
- Motivos de aprovação/rejeição são salvos
- Histórico completo de solicitações

## API Endpoints

### Cadastro de Técnico
```
POST /register-technician
Body: {
  username: string,
  email: string,
  password: string,
  full_name: string,
  employee_id: string,
  department: string,
  specialty: string[],
  phone: string,
  emergency_contact?: string,
  certifications?: string,
  experience_years?: string,
  availability: 'full-time' | 'part-time' | 'on-call',
  notes?: string,
  role: 'technician',
  is_active: false
}
```

### Listar Técnicos Pendentes (Admin)
```
GET /pending-technicians
Headers: { Authorization: Bearer <admin_token> }
```

### Aprovar/Rejeitar Técnico (Admin)
```
POST /approve-technician/{tech_id}
Headers: { Authorization: Bearer <admin_token> }
Body: {
  action: 'approve' | 'reject',
  reason: string
}
```

## Notificações

### E-mail de Confirmação
- Enviado após solicitação de cadastro
- Informa que está aguardando aprovação

### E-mail de Aprovação
- Enviado quando técnico é aprovado
- Contém instruções para primeiro acesso

### E-mail de Rejeição
- Enviado quando solicitação é rejeitada
- Contém motivo da rejeição

## Considerações Técnicas

### Banco de Dados
- Tabela separada ou campo adicional para dados técnicos
- Campos específicos para informações profissionais
- Relacionamento com tabela de usuários

### Validações Backend
- Verificar se e-mail/username já existem
- Validar formato dos dados
- Sanitizar entradas

### Segurança
- Senhas hashadas
- Tokens de autenticação
- Rate limiting para cadastros

## Manutenção

### Monitoramento
- Acompanhar número de solicitações pendentes
- Tempo médio de aprovação
- Taxa de aprovação/rejeição

### Melhorias Futuras
- Upload de documentos (certificações)
- Integração com sistema de RH
- Notificações em tempo real
- Dashboard de métricas para admins
