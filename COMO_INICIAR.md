# 🚀 Como Iniciar o Projeto Completo

## 📁 Estrutura do Projeto

```
projeto_prefeitura/
├── Chamado_tec_back/     # Backend (FastAPI - Python)
└── Chamado_Tec_Front/    # Frontend (React + Vite)
```

---

## 🔧 Pré-requisitos

### Backend:
- Python 3.12+
- Virtual environment (venv)
- Dependências instaladas (`requirements.txt`)

### Frontend:
- Node.js 20+ (via nvm)
- npm

---

## 🎯 Iniciar o Sistema Completo

### **Passo 1: Iniciar o Backend**

Abra um terminal e navegue até a pasta do backend:

```bash
cd "/home/luiz-felippe/Área de trabalho/projeto_prefeitura/Chamado_tec_back"
```

**Opção A - Usando o script (Linux):**
```bash
bash start.sh
```

**Opção B - Manualmente:**
```bash
# Ativar virtual environment
source venv/bin/activate

# Iniciar servidor
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Verificar se está rodando:**
- Acesse: `http://127.0.0.1:8000/docs` (Swagger UI)
- Ou: `http://127.0.0.1:8000` (deve retornar JSON)

---

### **Passo 2: Iniciar o Frontend**

Abra **outro terminal** e navegue até a pasta do frontend:

```bash
cd "/home/luiz-felippe/Área de trabalho/projeto_prefeitura/Chamado_Tec_Front"
```

**Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

**Verificar se está rodando:**
- Acesse: `http://localhost:5173` (ou a porta que o Vite indicar)
- Você deve ver a tela de login

---

## ✅ Verificação Rápida

### 1. **Backend está rodando?**
```bash
curl http://127.0.0.1:8000/docs
# Ou abra no navegador: http://127.0.0.1:8000/docs
```

### 2. **Frontend está rodando?**
- Abra: `http://localhost:5173`
- Deve aparecer a tela de login

### 3. **Teste de Conexão:**
- Tente fazer login
- Se o backend estiver rodando: login funciona ou mostra erro de credenciais
- Se o backend NÃO estiver rodando: Toast vermelho aparece com mensagem clara

---

## 🧪 Teste Rápido do Toast

### **Teste 1: Backend Desligado (Erro de Conexão)**
1. Certifique-se de que o backend **NÃO** está rodando
2. Tente fazer login
3. **Esperado:** Toast vermelho: "Servidor não está respondendo. Verifique se o backend está rodando na porta 8000."

### **Teste 2: Backend Ligado (Sucesso)**
1. Inicie o backend (Passo 1)
2. Inicie o frontend (Passo 2)
3. Tente fazer login com credenciais válidas
4. **Esperado:** Login bem-sucedido e redirecionamento

### **Teste 3: Credenciais Inválidas**
1. Com backend rodando, tente login com credenciais erradas
2. **Esperado:** Toast vermelho com mensagem de erro de autenticação

---

## 🐛 Troubleshooting

### **Erro: "Servidor não está respondendo"**
- ✅ Verifique se o backend está rodando na porta 8000
- ✅ Verifique se não há outro processo usando a porta 8000
- ✅ Verifique os logs do backend para erros

### **Erro: "Cannot find module" (Frontend)**
```bash
cd Chamado_Tec_Front
npm install
```

### **Erro: "Python not found" (Backend)**
```bash
# Verificar Python
python3 --version

# Ativar venv
source venv/bin/activate
```

### **Porta 8000 já em uso:**
```bash
# Verificar o que está usando a porta
lsof -i :8000

# Ou matar o processo
kill -9 $(lsof -t -i:8000)
```

---

## 📝 Comandos Úteis

### **Backend:**
```bash
# Ativar venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Rodar migrações (se necessário)
python run_migration.py

# Iniciar servidor
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### **Frontend:**
```bash
# Instalar dependências
npm install

# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Preview build
npm run preview
```

---

## 🎯 Próximos Testes

Depois que ambos estiverem rodando, teste:

1. ✅ **Login** → Toast de sucesso/erro
2. ✅ **Criar chamado** → Toast verde
3. ✅ **Atribuir técnico** (admin) → Toast verde
4. ✅ **Editar chamado** (admin) → Toast verde
5. ✅ **Loading spinners** durante operações

---

## 📚 Documentação Adicional

- **Guia de Testes Completo:** `TESTE_MELHORIAS.md`
- **O Que Falta:** `O_QUE_FALTA.md`
- **Backend README:** `../Chamado_tec_back/README.md`

