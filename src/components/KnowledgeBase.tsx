import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiWithAuth } from '../api/api'
import { formatDateTime } from '../utils/dateUtils'
import './KnowledgeBase.css'

export interface KnowledgeArticle {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  author_id: number
  created_at: string
  updated_at: string
  views: number
  helpful_count: number
  not_helpful_count: number
  is_published: boolean
}

interface KnowledgeBaseProps {
  canEdit?: boolean // Se o usuário pode criar/editar artigos (admin)
}

function KnowledgeBase({ canEdit = false }: KnowledgeBaseProps) {
  const { token, user } = useAuth()
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null)

  const categories = [
    'Hardware',
    'Software',
    'Rede',
    'Impressora',
    'Email',
    'Sistema',
    'Outros'
  ]

  useEffect(() => {
    if (token) {
      fetchArticles()
    }
  }, [token])

  useEffect(() => {
    filterArticles()
  }, [articles, searchTerm, selectedCategory])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const apiAuth = apiWithAuth(token)
      
      try {
        const response = await apiAuth.get('/knowledge-base/articles')
        const data = response.data || []
        
        const formattedArticles: KnowledgeArticle[] = data.map((article: any) => ({
          id: article.id,
          title: article.title || article.name || 'Artigo sem título',
          content: article.content || article.description || '',
          category: article.category || article.problem_type || 'Outros',
          tags: article.tags || [],
          author: article.author || article.author_name || 'Desconhecido',
          author_id: article.author_id || 0,
          created_at: article.created_at || new Date().toISOString(),
          updated_at: article.updated_at || article.created_at || new Date().toISOString(),
          views: article.views || 0,
          helpful_count: article.helpful_count || 0,
          not_helpful_count: article.not_helpful_count || 0,
          is_published: article.is_published !== undefined ? article.is_published : true
        }))
        
        setArticles(formattedArticles)
      } catch (error: any) {
        console.log('⚠️ Endpoint de Base de Conhecimento não disponível, usando dados locais')
        
        // Fallback: usar dados do localStorage ou criar artigos de exemplo
        const storedArticles = localStorage.getItem('knowledge-base-articles')
        if (storedArticles) {
          setArticles(JSON.parse(storedArticles))
        } else {
          // Criar artigos de exemplo
          const exampleArticles: KnowledgeArticle[] = [
            {
              id: 1,
              title: 'Como resetar senha do email',
              content: 'Para resetar sua senha de email:\n\n1. Acesse o portal de email\n2. Clique em "Esqueci minha senha"\n3. Digite seu email\n4. Siga as instruções enviadas por email\n\nSe tiver problemas, entre em contato com o suporte.',
              category: 'Email',
              tags: ['email', 'senha', 'reset'],
              author: 'Administrador',
              author_id: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              views: 45,
              helpful_count: 12,
              not_helpful_count: 2,
              is_published: true
            },
            {
              id: 2,
              title: 'Solução para impressora não imprime',
              content: 'Se sua impressora não está imprimindo:\n\n1. Verifique se está ligada e conectada\n2. Verifique se há papel na bandeja\n3. Verifique se há tinta/toner\n4. Reinicie a impressora\n5. Verifique se o driver está instalado corretamente\n\nSe o problema persistir, abra um chamado.',
              category: 'Impressora',
              tags: ['impressora', 'impressão', 'hardware'],
              author: 'Administrador',
              author_id: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              views: 78,
              helpful_count: 25,
              not_helpful_count: 3,
              is_published: true
            },
            {
              id: 3,
              title: 'Como conectar à rede Wi-Fi',
              content: 'Para conectar à rede Wi-Fi:\n\n1. Abra as configurações de rede\n2. Selecione a rede "Rede-Corporativa"\n3. Digite a senha fornecida pelo TI\n4. Aguarde a conexão\n\nA senha padrão é fornecida pelo departamento de TI.',
              category: 'Rede',
              tags: ['wifi', 'rede', 'conexão'],
              author: 'Administrador',
              author_id: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              views: 120,
              helpful_count: 45,
              not_helpful_count: 5,
              is_published: true
            }
          ]
          setArticles(exampleArticles)
          localStorage.setItem('knowledge-base-articles', JSON.stringify(exampleArticles))
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar artigos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterArticles = () => {
    let filtered = articles.filter(article => article.is_published)

    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    setFilteredArticles(filtered)
  }

  const handleArticleClick = (article: KnowledgeArticle) => {
    setSelectedArticle(article)
    // Incrementar visualizações
    if (token) {
      try {
        const apiAuth = apiWithAuth(token)
        apiAuth.post(`/knowledge-base/articles/${article.id}/view`).catch(() => {
          // Se falhar, atualizar localmente
          setArticles(prev => prev.map(a =>
            a.id === article.id ? { ...a, views: a.views + 1 } : a
          ))
        })
      } catch (error) {
        // Atualizar localmente
        setArticles(prev => prev.map(a =>
          a.id === article.id ? { ...a, views: a.views + 1 } : a
        ))
      }
    }
  }

  const handleHelpful = async (articleId: number, isHelpful: boolean) => {
    if (!token) return

    try {
      const apiAuth = apiWithAuth(token)
      await apiAuth.post(`/knowledge-base/articles/${articleId}/feedback`, {
        helpful: isHelpful
      })
      
      setArticles(prev => prev.map(a =>
        a.id === articleId
          ? {
              ...a,
              helpful_count: isHelpful ? a.helpful_count + 1 : a.helpful_count,
              not_helpful_count: !isHelpful ? a.not_helpful_count + 1 : a.not_helpful_count
            }
          : a
      ))
      
      if (selectedArticle?.id === articleId) {
        setSelectedArticle({
          ...selectedArticle,
          helpful_count: isHelpful ? selectedArticle.helpful_count + 1 : selectedArticle.helpful_count,
          not_helpful_count: !isHelpful ? selectedArticle.not_helpful_count + 1 : selectedArticle.not_helpful_count
        })
      }
    } catch (error) {
      // Atualizar localmente se a API falhar
      setArticles(prev => prev.map(a =>
        a.id === articleId
          ? {
              ...a,
              helpful_count: isHelpful ? a.helpful_count + 1 : a.helpful_count,
              not_helpful_count: !isHelpful ? a.not_helpful_count + 1 : a.not_helpful_count
            }
          : a
      ))
    }
  }

  if (loading) {
    return (
      <div className="knowledge-base">
        <div className="loading-state">
          <p>Carregando Base de Conhecimento...</p>
        </div>
      </div>
    )
  }

  if (selectedArticle) {
    return (
      <div className="knowledge-base">
        <div className="article-view">
          <button className="back-btn" onClick={() => setSelectedArticle(null)}>
            ← Voltar
          </button>
          <article className="article-content">
            <h1>{selectedArticle.title}</h1>
            <div className="article-meta">
              <span className="category-badge">{selectedArticle.category}</span>
              <span className="author">Por {selectedArticle.author}</span>
              <span className="date">{formatDateTime(selectedArticle.updated_at)}</span>
              <span className="views">👁️ {selectedArticle.views} visualizações</span>
            </div>
            <div className="article-tags">
              {selectedArticle.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
            <div className="article-body">
              {selectedArticle.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="article-feedback">
              <p>Este artigo foi útil?</p>
              <div className="feedback-buttons">
                <button
                  className="feedback-btn helpful"
                  onClick={() => handleHelpful(selectedArticle.id, true)}
                >
                  👍 Sim ({selectedArticle.helpful_count})
                </button>
                <button
                  className="feedback-btn not-helpful"
                  onClick={() => handleHelpful(selectedArticle.id, false)}
                >
                  👎 Não ({selectedArticle.not_helpful_count})
                </button>
              </div>
            </div>
            {canEdit && (
              <div className="article-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingArticle(selectedArticle)
                    setShowCreateModal(true)
                  }}
                >
                  ✏️ Editar
                </button>
              </div>
            )}
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="knowledge-base">
      <div className="knowledge-header">
        <h1>📚 Base de Conhecimento</h1>
        <p>Encontre soluções para problemas comuns</p>
        {canEdit && (
          <button
            className="create-article-btn"
            onClick={() => {
              setEditingArticle(null)
              setShowCreateModal(true)
            }}
          >
            ➕ Criar Artigo
          </button>
        )}
      </div>

      <div className="knowledge-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="articles-grid">
        {filteredArticles.length === 0 ? (
          <div className="empty-state">
            <p>📭 Nenhum artigo encontrado</p>
            {searchTerm && (
              <p className="empty-hint">Tente buscar com outros termos</p>
            )}
          </div>
        ) : (
          filteredArticles.map(article => (
            <div
              key={article.id}
              className="article-card"
              onClick={() => handleArticleClick(article)}
            >
              <div className="article-card-header">
                <span className="article-category">{article.category}</span>
                <span className="article-views">👁️ {article.views}</span>
              </div>
              <h3 className="article-title">{article.title}</h3>
              <p className="article-preview">
                {article.content.substring(0, 150)}...
              </p>
              <div className="article-card-footer">
                <div className="article-tags-preview">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag-small">#{tag}</span>
                  ))}
                </div>
                <div className="article-feedback-preview">
                  <span>👍 {article.helpful_count}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateArticleModal
          article={editingArticle}
          categories={categories}
          onClose={() => {
            setShowCreateModal(false)
            setEditingArticle(null)
          }}
          onSave={async (articleData) => {
            try {
              if (!token) throw new Error('Token não encontrado')
              
              const apiAuth = apiWithAuth(token)
              
              if (editingArticle) {
                // Editar artigo existente
                await apiAuth.put(`/knowledge-base/articles/${editingArticle.id}`, articleData)
              } else {
                // Criar novo artigo
                await apiAuth.post('/knowledge-base/articles', articleData)
              }
              
              await fetchArticles()
              setShowCreateModal(false)
              setEditingArticle(null)
              alert(editingArticle ? '✅ Artigo atualizado com sucesso!' : '✅ Artigo criado com sucesso!')
            } catch (error: any) {
              // Se a API não existir, salvar localmente
              const storedArticles = localStorage.getItem('knowledge-base-articles')
              const currentArticles: KnowledgeArticle[] = storedArticles ? JSON.parse(storedArticles) : []
              
              if (editingArticle) {
                const updated = currentArticles.map(a =>
                  a.id === editingArticle.id
                    ? { ...a, ...articleData, updated_at: new Date().toISOString() }
                    : a
                )
                localStorage.setItem('knowledge-base-articles', JSON.stringify(updated))
              } else {
                const newArticle: KnowledgeArticle = {
                  id: Date.now(),
                  ...articleData,
                  author: user?.full_name || 'Administrador',
                  author_id: user?.id || 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  views: 0,
                  helpful_count: 0,
                  not_helpful_count: 0,
                  is_published: true
                }
                currentArticles.unshift(newArticle)
                localStorage.setItem('knowledge-base-articles', JSON.stringify(currentArticles))
              }
              
              await fetchArticles()
              setShowCreateModal(false)
              setEditingArticle(null)
              alert(editingArticle ? '✅ Artigo atualizado com sucesso!' : '✅ Artigo criado com sucesso!')
            }
          }}
        />
      )}
    </div>
  )
}

// Modal para criar/editar artigo
interface CreateArticleModalProps {
  article: KnowledgeArticle | null
  categories: string[]
  onClose: () => void
  onSave: (data: {
    title: string
    content: string
    category: string
    tags: string[]
    is_published: boolean
  }) => Promise<void>
}

function CreateArticleModal({ article, categories, onClose, onSave }: CreateArticleModalProps) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    category: article?.category || 'Outros',
    tags: article?.tags.join(', ') || '',
    is_published: article?.is_published !== undefined ? article.is_published : true
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório'
    if (!formData.content.trim()) newErrors.content = 'Conteúdo é obrigatório'
    if (!formData.category) newErrors.category = 'Categoria é obrigatória'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      await onSave({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        is_published: formData.is_published
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content knowledge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{article ? '✏️ Editar Artigo' : '➕ Criar Artigo'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="article-form">
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label>Categoria *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={errors.category ? 'error' : ''}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>
          <div className="form-group">
            <label>Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="ex: email, senha, reset"
            />
          </div>
          <div className="form-group">
            <label>Conteúdo *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className={errors.content ? 'error' : ''}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              Publicar imediatamente
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Salvando...' : (article ? '💾 Salvar Alterações' : '💾 Criar Artigo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default KnowledgeBase

