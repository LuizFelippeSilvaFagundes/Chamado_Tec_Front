import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { uploadTicketAttachments } from '../api/api'
import FileUpload, { type UploadedFile } from './FileUpload'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import LoadingSpinner from './LoadingSpinner'
import './OpenTicket.css'

interface TicketForm {
  title: string
  description: string
  problemType: string
  location: string
  priority: 'low' | 'medium' | 'high'
  equipment: string
  urgency: string
  attachments: UploadedFile[]
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

const priorities = [
  { value: 'low', label: 'Baixa', color: '#10b981' },
  { value: 'medium', label: 'Média', color: '#f59e0b' },
  { value: 'high', label: 'Alta', color: '#ef4444' }
]

function OpenTicket({ onTicketCreated }: OpenTicketProps) {
  const { showSuccess: showSuccessToast, showError: showErrorToast } = useToast()
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
  const [errors, setErrors] = useState<Partial<TicketForm>>({})

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo
    if (errors[name as keyof TicketForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFilesChange = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, attachments: files }))
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
        const errorMessage = handleApiError(data)
        throw new Error(errorMessage)
      }

      const ticketResponse = await res.json()
      const ticketId = ticketResponse.id

      // Upload de anexos se houver
      if (formData.attachments.length > 0) {
        try {
          const filesToUpload = formData.attachments.map(uf => uf.file)
          await uploadTicketAttachments(token, ticketId, filesToUpload)
          console.log('✅ Anexos enviados com sucesso!')
        } catch (err) {
          console.error('Erro ao enviar anexos:', err)
          const errorMessage = handleApiError(err)
          showErrorToast(`Chamado criado, mas houve erro ao enviar anexos: ${errorMessage}`)
          // Não interrompe o fluxo - ticket já foi criado
        }
      }

      // Sucesso
      showSuccessToast('Chamado criado com sucesso!')
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
      
      // Navegar para "Meus Chamados" após um breve delay
      setTimeout(() => {
        if (onTicketCreated) {
          onTicketCreated()
        }
      }, 1000)
      
    } catch (error) {
      console.error('Erro ao enviar chamado:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return (
      <div className="open-ticket">
        <LoadingSpinner size="large" message="Criando chamado..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="open-ticket">
      <div className="section-header">
        <h1>Novo chamado</h1>
      </div>

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
                <FileUpload
                  files={formData.attachments}
                  onFilesChange={handleFilesChange}
                  maxFiles={10}
                  maxSizeMB={10}
                  acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']}
                  multiple={true}
                  disabled={isSubmitting}
                />
              </div>
            </div>

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
