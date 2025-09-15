import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import './OpenTicket.css'

interface TicketForm {
  title: string
  description: string
  problemType: string
  location: string
  priority: 'low' | 'medium' | 'high'
  attachments: File[]
}

const problemTypes = [
  'TI / Computador',
  'Limpeza',
  'Manutenção',
  'Iluminação',
  'Segurança',
  'Outros'
]

const locations = [
  'Setor Administrativo',
  'Setor Financeiro',
  'Setor de Recursos Humanos',
  'Setor de Tecnologia',
  'Setor de Limpeza',
  'Setor de Manutenção',
  'Área Externa',
  'Outros'
]

const priorities = [
  { value: 'low', label: 'Baixa', color: 'green' },
  { value: 'medium', label: 'Média', color: 'orange' },
  { value: 'high', label: 'Alta', color: 'red' }
]

function OpenTicket() {
  const [formData, setFormData] = useState<TicketForm>({
    title: '',
    description: '',
    problemType: '',
    location: '',
    priority: 'medium',
    attachments: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errors, setErrors] = useState<Partial<TicketForm>>({})

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erro do campo
    if (errors[name as keyof TicketForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setFormData(prev => ({ ...prev, attachments: filesArray }))
    }
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
        priority: formData.priority
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

      // Sucesso
      setShowSuccess(true)
      setFormData({
        title: '',
        description: '',
        problemType: '',
        location: '',
        priority: 'medium',
        attachments: []
      })
      
      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => setShowSuccess(false), 3000)
      
    } catch (error) {
      console.error('Erro ao enviar chamado:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao enviar chamado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="open-ticket">
      <div className="section-header">
        <h1>📝 Abrir Novo Chamado</h1>
        <p>Descreva o problema para que possamos ajudá-lo</p>
      </div>

      {showSuccess && (
        <div className="success-message">
          ✅ Chamado enviado com sucesso! Em breve entraremos em contato.
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          ❌ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Título do Chamado *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Computador não liga"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="problemType">Tipo de Problema *</label>
            <select
              id="problemType"
              name="problemType"
              value={formData.problemType}
              onChange={handleInputChange}
              className={errors.problemType ? 'error' : ''}
            >
              <option value="">Selecione o tipo</option>
              {problemTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.problemType && <span className="error-text">{errors.problemType}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Setor/Localização *</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={errors.location ? 'error' : ''}
            >
              <option value="">Selecione o local</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Prioridade</label>
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
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Descrição Detalhada *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descreva detalhadamente o problema, incluindo quando começou, frequência, etc."
            rows={5}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="attachments">Anexos (opcional)</label>
          <input
            type="file"
            id="attachments"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="file-input"
          />
          <p className="file-help">Formatos aceitos: imagens, PDF, Word. Máximo 5 arquivos.</p>
          
          {formData.attachments.length > 0 && (
            <div className="attachments-list">
              {formData.attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <span className="file-name">{file.name}</span>
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => removeAttachment(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : '📤 Enviar Chamado'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OpenTicket
