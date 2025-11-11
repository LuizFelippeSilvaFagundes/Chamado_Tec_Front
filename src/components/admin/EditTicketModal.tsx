import { useState, useEffect } from 'react'
import './EditTicketModal.css'

interface Ticket {
  id: number
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  problem_type?: string
  status?: string
  assigned_technician?: {
    id: number
    full_name: string
  }
}

interface EditTicketModalProps {
  ticket: Ticket
  onClose: () => void
  onSave: (data: {
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
    problem_type?: string
    status?: string
  }) => Promise<void>
  isSaving: boolean
}

function EditTicketModal({ ticket, onClose, onSave, isSaving }: EditTicketModalProps) {
  const [formData, setFormData] = useState({
    title: ticket.title || '',
    description: ticket.description || '',
    priority: ticket.priority || 'medium' as 'low' | 'medium' | 'high' | 'critical',
    problem_type: ticket.problem_type || '',
    status: ticket.status || 'open'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'medium',
      problem_type: ticket.problem_type || '',
      status: ticket.status || 'open'
    })
  }, [ticket])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    if (!formData.problem_type.trim()) {
      newErrors.problem_type = 'Categoria é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSave(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const priorityOptions = [
    { value: 'low', label: 'Baixa', color: '#10b981' },
    { value: 'medium', label: 'Média', color: '#f59e0b' },
    { value: 'high', label: 'Alta', color: '#ef4444' },
    { value: 'critical', label: 'Crítica', color: '#dc2626' }
  ]

  const statusOptions = [
    { value: 'open', label: 'Aberto' },
    { value: 'pending', label: 'Pendente' },
    { value: 'in-progress', label: 'Em Atendimento' },
    { value: 'resolved', label: 'Resolvido' },
    { value: 'closed', label: 'Fechado' }
  ]

  const problemTypes = [
    'Hardware',
    'Software',
    'Rede',
    'Impressora',
    'Email',
    'Sistema',
    'Outros'
  ]

  return (
    <div className="edit-ticket-modal-overlay" onClick={onClose}>
      <div className="edit-ticket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-ticket-modal-header">
          <h2>✏️ Editar Chamado</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-ticket-form">
          <div className="form-section">
            <h3>Informações Básicas</h3>
            
            <div className="form-group">
              <label htmlFor="title">
                Título <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? 'error' : ''}
                placeholder="Digite o título do chamado"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Descrição <span className="required">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={errors.description ? 'error' : ''}
                placeholder="Digite a descrição do chamado"
                rows={5}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="problem_type">
                  Categoria <span className="required">*</span>
                </label>
                <select
                  id="problem_type"
                  value={formData.problem_type}
                  onChange={(e) => handleChange('problem_type', e.target.value)}
                  className={errors.problem_type ? 'error' : ''}
                >
                  <option value="">Selecione uma categoria</option>
                  {problemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.problem_type && <span className="error-message">{errors.problem_type}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="priority">Prioridade</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTicketModal

