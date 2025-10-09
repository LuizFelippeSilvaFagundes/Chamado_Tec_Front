import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadAvatar, deleteMyAvatar } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import './AvatarUpload.css';

interface AvatarUploadProps {
  onClose?: () => void;
  onAvatarUpdate?: (avatarUrl: string | null) => void;
}

function AvatarUpload({ onClose, onAvatarUpdate }: AvatarUploadProps) {
  const { token, user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    user?.avatar_url ? `http://127.0.0.1:8000${user.avatar_url}` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    console.log('📸 Arquivo selecionado:', file?.name);
    
    if (!file) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.log('❌ Tipo inválido:', file.type);
      setError('Formato inválido! Use JPG, PNG, GIF ou WEBP');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ Arquivo muito grande:', file.size);
      setError('Arquivo muito grande! Máximo 5MB');
      return;
    }

    console.log('✅ Arquivo válido! Carregando preview...');
    setError(null);
    setSuccess(null);

    // Criar preview para crop
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('✅ Preview carregado! Abrindo crop...');
      setSelectedImage(reader.result as string);
      setShowCrop(true);
    };
    reader.onerror = () => {
      console.log('❌ Erro ao ler arquivo');
      setError('Erro ao carregar imagem');
    };
    reader.readAsDataURL(file);
  };

  // Função para gerar imagem recortada
  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    // Definir tamanho do canvas (imagem final 400x400)
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      400,
      400
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  }, [completedCrop]);

  const handleConfirmCrop = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Gerar imagem recortada
      const croppedBlob = await getCroppedImage();
      if (!croppedBlob) {
        setError('Erro ao processar imagem');
        setLoading(false);
        return;
      }

      // Converter Blob para File
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

      // Upload
      const response = await uploadAvatar(token, croppedFile);
      const avatarUrl = response.data.avatar_url;
      
      setSuccess('✅ Avatar atualizado com sucesso!');
      setCurrentAvatar(`http://127.0.0.1:8000${avatarUrl}`);
      setShowCrop(false);
      setSelectedImage(null);
      
      // Atualizar localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.avatar_url = avatarUrl;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Callback para atualizar Header em tempo real
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarUrl);
      }

      // Fechar modal após 1.5 segundos
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer upload do avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCrop = () => {
    setShowCrop(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar seu avatar?')) return;
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteMyAvatar(token);
      
      setCurrentAvatar(null);
      setSuccess('🗑️ Avatar deletado com sucesso!');

      // Atualizar localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userData.avatar_url = null;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Callback para atualizar Header em tempo real
      if (onAvatarUpdate) {
        onAvatarUpdate(null);
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao deletar avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="avatar-upload-modal" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="avatar-upload-content">
        <div className="modal-header">
          <h2>📸 Meu Avatar</h2>
          {onClose && (
            <button className="close-btn" onClick={onClose}>✕</button>
          )}
        </div>

        {!showCrop ? (
          <>
            {/* Preview do Avatar Atual */}
            <div className="avatar-preview">
              {currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt="Avatar Atual" 
                  className="preview-image"
                />
              ) : (
                <div className="no-avatar">
                  <span className="no-avatar-icon">👤</span>
                  <p>Sem Avatar</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                📁 Escolher Nova Foto
              </button>

              {currentAvatar && (
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? '⏳ Deletando...' : '🗑️ Remover Avatar'}
                </button>
              )}
            </div>

            <div className="file-info">
              <p className="text-muted">
                📏 Formatos: JPG, PNG, GIF, WEBP
              </p>
              <p className="text-muted">
                📦 Tamanho máximo: 5MB
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Editor de Crop */}
            <div className="crop-container">
              <h3>✂️ Ajuste sua foto</h3>
              <p className="text-muted" style={{ marginBottom: '15px' }}>
                Arraste e redimensione a área de seleção
              </p>

              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={selectedImage!}
                  alt="Crop preview"
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
              </ReactCrop>
            </div>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <div className="button-group" style={{ marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={handleCancelCrop}
                disabled={loading}
              >
                ← Voltar
              </button>
              
              <button
                className="btn btn-success"
                onClick={handleConfirmCrop}
                disabled={loading || !completedCrop}
              >
                {loading ? '⏳ Salvando...' : '✅ Salvar Avatar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AvatarUpload;

