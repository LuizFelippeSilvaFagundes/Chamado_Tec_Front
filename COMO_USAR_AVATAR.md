# 📸 Como Usar o Sistema de Avatar

## ✅ O que foi integrado:

### **1. Novos Componentes:**
- ✅ `AvatarUpload.tsx` - Modal de upload/delete de avatar
- ✅ `AvatarUpload.css` - Estilos do modal

### **2. Atualizações:**
- ✅ `Header.tsx` - Agora mostra o avatar e permite alterá-lo
- ✅ `Header.css` - Estilos para o avatar no header
- ✅ `AuthContext.tsx` - Adicionado `avatar_url` ao tipo User
- ✅ `api.ts` - Funções para upload/get/delete de avatar

---

## 🚀 Como Funciona:

### **1. Visualizar Avatar:**
O avatar aparece automaticamente no **Header** (canto superior direito).

### **2. Alterar Avatar:**
1. Clique no seu **avatar/ícone** no header
2. Selecione **"📸 Alterar Avatar"** no menu
3. Modal abre automaticamente
4. Clique em **"📁 Selecionar Foto"**
5. Escolha uma imagem (JPG, PNG, GIF, WEBP)
6. Clique em **"✅ Salvar Avatar"**
7. Pronto! Avatar atualizado! 🎉

### **3. Deletar Avatar:**
1. Abra o modal (mesmo caminho acima)
2. Clique em **"🗑️ Deletar Avatar"**
3. Confirme a ação
4. Avatar removido!

---

## 🎨 Personalizações Possíveis:

### **Usar o componente em outras páginas:**

```tsx
import AvatarUpload from '../components/AvatarUpload';

function MinhaPagina() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Alterar Avatar
      </button>

      {showModal && (
        <AvatarUpload 
          onClose={() => setShowModal(false)}
          onAvatarUpdate={(url) => console.log('Novo avatar:', url)}
        />
      )}
    </>
  );
}
```

### **Mostrar avatar de outro usuário:**

```tsx
function UserCard({ userId, avatarUrl }: { userId: number, avatarUrl: string | null }) {
  const API_URL = 'http://127.0.0.1:8000';

  return (
    <div>
      {avatarUrl ? (
        <img 
          src={`${API_URL}${avatarUrl}`} 
          alt="Avatar" 
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <div>Sem avatar</div>
      )}
    </div>
  );
}
```

---

## 🔧 Configurações:

### **Alterar tamanho máximo do arquivo:**

Em `AvatarUpload.tsx`, linha ~31:
```tsx
if (file.size > 5 * 1024 * 1024) { // 5MB
  // Altere para 10 * 1024 * 1024 para 10MB
}
```

### **Alterar formatos aceitos:**

Em `AvatarUpload.tsx`, linha ~27:
```tsx
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
// Adicione ou remova formatos conforme necessário
```

### **Alterar tamanho do avatar no Header:**

Em `Header.css`, linha ~99:
```css
.user-avatar-img {
  width: 32px;   /* Altere aqui */
  height: 32px;  /* Altere aqui */
  /* ... */
}
```

---

## 📱 Responsivo:

O modal de avatar é totalmente responsivo e funciona bem em:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

---

## 🐛 Troubleshooting:

### **Avatar não aparece:**
- Verifique se o backend está rodando em `http://127.0.0.1:8000`
- Confirme que o arquivo foi enviado com sucesso
- Verifique o console do navegador para erros

### **Erro ao fazer upload:**
- Verifique o formato do arquivo (JPG, PNG, GIF, WEBP)
- Confirme que o arquivo não ultrapassa 5MB
- Verifique se está autenticado (token válido)

### **Avatar não atualiza:**
- A página recarrega automaticamente após upload
- Se não recarregar, faça F5 manualmente

---

## 🎯 Endpoints Usados:

```
POST   /avatars/upload    - Upload de avatar
GET    /avatars/me        - Ver seu avatar
DELETE /avatars/me        - Deletar avatar
```

---

## 💡 Dicas:

### **Foto de perfil ideal:**
- ✅ Formato quadrado (ex: 500x500px)
- ✅ Fundo neutro ou transparente
- ✅ Rosto centralizado
- ✅ Boa iluminação
- ✅ Tamanho: 200KB - 1MB (ideal)

### **Performance:**
- Avatares são automaticamente servidos pelo backend
- Cache do navegador é utilizado
- Imagens pequenas carregam mais rápido

---

## ✨ Próximas Melhorias Possíveis:

- [ ] Crop/resize de imagem antes do upload
- [ ] Preview com filtros
- [ ] Upload via drag & drop
- [ ] Avatares padrão escolhíveis
- [ ] Compressão automática de imagens

---

**Pronto! Sistema de avatar totalmente integrado e funcional!** 🎊

