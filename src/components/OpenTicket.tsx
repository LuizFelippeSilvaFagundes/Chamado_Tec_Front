import { useState, useRef } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { uploadTicketAttachments } from '../api/api'
import './OpenTicket.css'

interface TicketForm {
  title: string
  description: string
  problemType: string
  location: string
  priority: 'low' | 'medium' | 'high'
  equipment: string
  urgency: string
  attachments: File[]
}

interface OpenTicketProps {
  onTicketCreated?: () => void
}

const problemTypes = [
  'Problemas de Hardware',
  'Problemas de Software',
  'Problemas de Rede',
  'Problemas de Impressão',
  'Problemas de Email',
  'Problemas de Backup',
  'Instalação de Software',
  'Configuração de Sistema',
  'Manutenção Preventiva',
  'Limpeza',
  'Iluminação',
  'Segurança',
  'Outros'
]

const locations = [
  'Escritório Principal',
  'Sala de Reunião 1',
  'Sala de Reunião 2',
  'Recepção',
  'Almoxarifado',
  'Laboratório de Informática',
  'Sala de Servidores',
  'Setor Administrativo',
  'Setor Financeiro',
  'Setor de Recursos Humanos',
  'Setor de Tecnologia',
  'Área Externa',
  'Outros'
]

const equipmentTypes = [
  'Computador Desktop',
  'Notebook',
  'Impressora',
  'Servidor',
  'Switch/Router',
  'Telefone IP',
  'Monitor',
  'Teclado/Mouse',
  'Projetor',
  'Outros'
]

const urgencyLevels = [
  { value: 'low', label: 'Baixa', description: 'Pode aguardar até 48h', color: '#10b981' },
  { value: 'medium', label: 'Média', description: 'Deve ser resolvido em 24h', color: '#f59e0b' },
  { value: 'high', label: 'Alta', description: 'Deve ser resolvido em 4h', color: '#ef4444' },
  { value: 'critical', label: 'Crítica', description: 'Deve ser resolvido imediatamente', color: '#dc2626' }
]

const priorities = [
  { value: 'low', label: 'Baixa', color: '#10b981' },
  { value: 'medium', label: 'Média', color: '#f59e0b' },
  { value: 'high', label: 'Alta', color: '#ef4444' }
]

function OpenTicket({ onTicketCreated }: OpenTicketProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<TicketForm>({
    title: '',
    description: '',
    problemType: '',
    location: '',
    priority: 'medium',
    equipment: '',
    urgency: 'medium',
    attachments: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errors, setErrors] = useState<Partial<TicketForm>>({})
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo
    if (errors[name as keyof TicketForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files)
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...filesArray] }))
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<TicketForm> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }
    if (!formData.problemType) {
      newErrors.problemType = 'Tipo de problema é obrigatório'
    }
    if (!formData.location) {
      newErrors.location = 'Localização é obrigatória'
    }
    if (!formData.equipment) {
      newErrors.equipment = 'Equipamento é obrigatório'
    }
    if (!formData.urgency) {
      newErrors.urgency = 'Urgência é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const ticketData = {
        title: formData.title,
        description: formData.description,
        problem_type: formData.problemType,
        location: formData.location,
        priority: formData.priority,
        equipment: formData.equipment,
        urgency: formData.urgency,
        username: JSON.parse(localStorage.getItem('user') || '{}').username
      }

      const res = await fetch('http://127.0.0.1:8000/tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Erro ao criar ticket')
      }

      const ticketResponse = await res.json()
      const ticketId = ticketResponse.id

      // Upload de anexos se houver
      if (formData.attachments.length > 0) {
        try {
          await uploadTicketAttachments(token, ticketId, formData.attachments)
          console.log('✅ Anexos enviados com sucesso!')
        } catch (err) {
          console.error('Erro ao enviar anexos:', err)
          // Não interrompe o fluxo - ticket já foi criado
        }
      }

      // Sucesso
      setShowSuccess(true)
      setFormData({
        title: '',
        description: '',
        problemType: '',
        location: '',
        priority: 'medium',
        equipment: '',
        urgency: 'medium',
        attachments: []
      })
      
      // Esconder mensagem de sucesso após 3 segundos e navegar para "Meus Chamados"
      setTimeout(() => {
        setShowSuccess(false)
        // Chamar callback para navegar para "Meus Chamados"
        if (onTicketCreated) {
          onTicketCreated()
        }
      }, 2000) // Reduzido para 2 segundos para melhor UX
      
    } catch (error) {
      console.error('Erro ao enviar chamado:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao enviar chamado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="open-ticket">
      <div className="section-header">
        <h1>Novo chamado</h1>
      </div>

      {showSuccess && (
        <div className="success-message">
          ✅ Chamado enviado com sucesso! Redirecionando para "Meus Chamados"...
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          ❌ {errorMessage}
        </div>
      )}

      <div className="ticket-form-container">
        <div className="form-section information-section">
          <h2>Informações do Chamado</h2>
          <p className="section-description">Preencha todos os campos para criar um chamado detalhado e profissional</p>
          
          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">TÍTULO DO CHAMADO</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Computador não liga"
                  className={errors.title ? 'error' : ''}
                  required
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="problemType">CATEGORIA DO PROBLEMA</label>
                <select
                  id="problemType"
                  name="problemType"
                  value={formData.problemType}
                  onChange={handleInputChange}
                  className={errors.problemType ? 'error' : ''}
                  required
                >
                  <option value="">Selecione a categoria</option>
                  {problemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.problemType && <span className="error-text">{errors.problemType}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">DESCRIÇÃO DETALHADA</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva detalhadamente o problema, incluindo quando começou, o que você estava fazendo quando ocorreu, e qualquer mensagem de erro que apareceu..."
                rows={5}
                className={errors.description ? 'error' : ''}
                required
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="equipment">EQUIPAMENTO AFETADO</label>
                <select
                  id="equipment"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  className={errors.equipment ? 'error' : ''}
                  required
                >
                  <option value="">Selecione o equipamento</option>
                  {equipmentTypes.map(equipment => (
                    <option key={equipment} value={equipment}>{equipment}</option>
                  ))}
                </select>
                {errors.equipment && <span className="error-text">{errors.equipment}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location">LOCALIZAÇÃO</label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={errors.location ? 'error' : ''}
                  required
                >
                  <option value="">Selecione o local</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">PRIORIDADE</label>
                <div className="priority-buttons">
                  {priorities.map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      className={`priority-btn ${formData.priority === priority.value ? 'active' : ''}`}
                      style={{ '--priority-color': priority.color } as React.CSSProperties}
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="attachments">ANEXAR IMAGENS/ARQUIVOS</label>
                <div 
                  className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="upload-content">
                    <div className="upload-icon">📎</div>
                    <div className="upload-text">
                      <strong>Arraste e solte arquivos aqui</strong>
                      <span>ou clique para selecionar</span>
                    </div>
                    <div className="upload-formats">
                      Formatos aceitos: JPG, PNG, PDF, DOC, DOCX (máx. 10MB)
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="attachments"
                    name="attachments"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </div>
              </div>
            </div>

            {formData.attachments.length > 0 && (
              <div className="attachments-list">
                <h4>Anexos ({formData.attachments.length})</h4>
                {formData.attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <div className="attachment-info">
                      <span className="attachment-name">{file.name}</span>
                      <span className="attachment-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="remove-attachment"
                      onClick={() => removeAttachment(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="create-ticket-btn"
              >
                {isSubmitting ? 'Criando chamado...' : 'Criar chamado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OpenTicket
