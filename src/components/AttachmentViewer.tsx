import { useState } from 'react'
import { downloadTicketAttachment, deleteTicketAttachment, getApiUrl } from '../api/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { handleApiError } from '../utils/errorHandler'
import './AttachmentViewer.css'

export interface Attachment {
  id?: number
  filename: string
  url?: string
  size?: number
  type?: string
  created_at?: string
}

interface AttachmentViewerProps {
  attachments: Attachment[]
  ticketId: number
  canDelete?: boolean
  onAttachmentDeleted?: () => void
}

function AttachmentViewer({
  attachments,
  ticketId,
  canDelete = false,
  onAttachmentDeleted
}: AttachmentViewerProps) {
  const { token } = useAuth()
  const { showError: showErrorToast, showSuccess: showSuccessToast } = useToast()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Tamanho desconhecido'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (attachment: Attachment): string => {
    const filename = attachment.filename.toLowerCase()
    const type = attachment.type?.toLowerCase() || ''

    if (type.startsWith('image/') || filename.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return '🖼️'
    }
    if (type.includes('pdf') || filename.endsWith('.pdf')) {
      return '📄'
    }
    if (type.includes('word') || filename.match(/\.(doc|docx)$/)) {
      return '📝'
    }
    if (type.includes('excel') || filename.match(/\.(xls|xlsx)$/)) {
      return '📊'
    }
    if (type.includes('text') || filename.endsWith('.txt')) {
      return '📃'
    }
    if (type.includes('zip') || filename.match(/\.(zip|rar|7z)$/)) {
      return '📦'
    }
    return '📎'
  }

  const isImage = (attachment: Attachment): boolean => {
    const filename = attachment.filename.toLowerCase()
    const type = attachment.type?.toLowerCase() || ''
    return type.startsWith('image/') || !!filename.match(/\.(jpg|jpeg|png|gif|webp)$/)
  }

  const getImageUrl = (attachment: Attachment): string => {
    if (attachment.url) {
      if (attachment.url.startsWith('http')) {
        return attachment.url
      }
      return `${getApiUrl()}${attachment.url}`
    }
    return ''
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      if (attachment.url) {
        const url = getImageUrl(attachment)
        if (url) {
          // Tentar usar a função de download da API se tiver token
          if (token) {
            try {
              downloadTicketAttachment(ticketId, attachment.filename)
              return
            } catch (error) {
              console.warn('Erro ao usar API de download, usando fallback:', error)
            }
          }
          // Fallback: abrir URL diretamente
          window.open(url, '_blank')
        }
      } else {
        // Se não tiver URL, tentar construir URL de download
        const downloadUrl = `${getApiUrl()}/tickets/${ticketId}/attachments/download/${attachment.filename}`
        window.open(downloadUrl, '_blank')
      }
    } catch (error) {
      console.error('Erro ao baixar anexo:', error)
      // Último fallback: tentar abrir URL diretamente
      const url = getImageUrl(attachment)
      if (url) {
        window.open(url, '_blank')
      }
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    if (!canDelete || !token || !attachment.id) return

    if (!window.confirm(`Tem certeza que deseja deletar o arquivo "${attachment.filename}"?`)) {
      return
    }

    try {
      setDeleting(attachment.id)
      await deleteTicketAttachment(token, ticketId, attachment.filename)
      if (onAttachmentDeleted) {
        onAttachmentDeleted()
      }
      showSuccessToast('Anexo removido com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar anexo:', error)
      const errorMessage = handleApiError(error)
      showErrorToast(`Erro ao remover anexo: ${errorMessage}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleImageClick = (attachment: Attachment) => {
    if (isImage(attachment)) {
      setSelectedImage(getImageUrl(attachment))
    }
  }

  if (attachments.length === 0) {
    return null
  }

  return (
    <>
      <div className="attachment-viewer">
        <h4>📎 Anexos ({attachments.length})</h4>
        <div className="attachments-grid">
          {attachments.map((attachment, index) => {
            const imageUrl = isImage(attachment) ? getImageUrl(attachment) : null

            return (
              <div key={attachment.id || index} className="attachment-item">
                {imageUrl ? (
                  <div
                    className="attachment-preview-image"
                    onClick={() => handleImageClick(attachment)}
                  >
                    <img
                      src={imageUrl}
                      alt={attachment.filename}
                      className="attachment-thumbnail"
                      loading="lazy"
                    />
                    <div className="attachment-overlay">
                      <span className="view-icon">👁️</span>
                    </div>
                  </div>
                ) : (
                  <div className="attachment-icon-large">
                    <span className="file-icon">{getFileIcon(attachment)}</span>
                  </div>
                )}
                <div className="attachment-details">
                  <div className="attachment-name" title={attachment.filename}>
                    {attachment.filename}
                  </div>
                  {attachment.size && (
                    <div className="attachment-size">
                      {formatFileSize(attachment.size)}
                    </div>
                  )}
                  <div className="attachment-actions">
                    <button
                      className="action-btn download-btn"
                      onClick={() => handleDownload(attachment)}
                      title="Baixar arquivo"
                    >
                      ⬇️ Baixar
                    </button>
                    {canDelete && (
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(attachment)}
                        disabled={deleting === attachment.id}
                        title="Deletar arquivo"
                      >
                        {deleting === attachment.id ? '⏳' : '🗑️'} Deletar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-image-modal"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img src={selectedImage} alt="Preview" className="modal-image" />
          </div>
        </div>
      )}
    </>
  )
}

export default AttachmentViewer

