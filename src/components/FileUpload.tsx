import { useState, useRef, useCallback } from 'react'
import './FileUpload.css'

export interface UploadedFile {
  file: File
  preview?: string
  id: string
  progress?: number
  error?: string
}

interface FileUploadProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  multiple?: boolean
  disabled?: boolean
}

function FileUpload({
  files,
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  multiple = true,
  disabled = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validateFile = (file: File): string | null => {
    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `O arquivo "${file.name}" excede o tamanho máximo de ${maxSizeMB}MB`
    }

    // Validar tipo
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        // Tipo genérico (ex: image/*)
        const baseType = type.split('/')[0]
        return file.type.startsWith(`${baseType}/`)
      } else {
        // Tipo específico (ex: .pdf)
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
    })

    if (!isValidType) {
      return `O arquivo "${file.name}" não é um tipo aceito. Formatos aceitos: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const processFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const newUploadedFiles: UploadedFile[] = []
    const newErrors: string[] = []

    // Validar número máximo de arquivos
    if (files.length + fileArray.length > maxFiles) {
      newErrors.push(`Você pode adicionar no máximo ${maxFiles} arquivos`)
      setErrors(newErrors)
      return
    }

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
        return
      }

      const uploadedFile: UploadedFile = {
        file,
        id: `${Date.now()}-${Math.random()}`,
        progress: 0
      }

      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string
          onFilesChange([...files, ...newUploadedFiles, uploadedFile])
        }
        reader.readAsDataURL(file)
      } else {
        newUploadedFiles.push(uploadedFile)
      }
    })

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setTimeout(() => setErrors([]), 5000)
    }

    if (newUploadedFiles.length > 0) {
      onFilesChange([...files, ...newUploadedFiles])
    }
  }, [files, maxFiles, acceptedTypes, onFilesChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [disabled, processFiles])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      // Reset input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [processFiles])

  const handleRemoveFile = useCallback((id: string) => {
    onFilesChange(files.filter(f => f.id !== id))
  }, [files, onFilesChange])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (file: File): string => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.includes('pdf')) return '📄'
    if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) return '📝'
    if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) return '📊'
    if (file.type.includes('text') || file.name.endsWith('.txt')) return '📃'
    return '📎'
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="file-input"
          disabled={disabled}
        />
        <div className="upload-content">
          <div className="upload-icon">📎</div>
          <div className="upload-text">
            <strong>Arraste e solte arquivos aqui</strong>
            <span>ou clique para selecionar</span>
          </div>
          <div className="upload-info">
            Formatos aceitos: {acceptedTypes.join(', ').replace(/\/\*/g, 's')}
            <br />
            Tamanho máximo: {maxSizeMB}MB por arquivo
            {maxFiles > 1 && ` • Máximo ${maxFiles} arquivos`}
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="upload-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="uploaded-files">
          <h4>Arquivos selecionados ({files.length})</h4>
          <div className="files-grid">
            {files.map(uploadedFile => (
              <div key={uploadedFile.id} className="file-item">
                {uploadedFile.preview ? (
                  <div className="file-preview-image">
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="preview-img"
                    />
                    <button
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(uploadedFile.id)
                      }}
                      title="Remover arquivo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="file-preview-icon">
                    <span className="file-icon">{getFileIcon(uploadedFile.file)}</span>
                    <button
                      className="remove-file-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(uploadedFile.id)
                      }}
                      title="Remover arquivo"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="file-info">
                  <div className="file-name" title={uploadedFile.file.name}>
                    {uploadedFile.file.name}
                  </div>
                  <div className="file-size">{formatFileSize(uploadedFile.file.size)}</div>
                  {uploadedFile.error && (
                    <div className="file-error">{uploadedFile.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload

