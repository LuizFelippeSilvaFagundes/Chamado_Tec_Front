import React, { useState } from 'react';
import { registerAdmin } from '../api/api';
import './AdminRegister.css';

interface AdminRegisterProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AdminRegister: React.FC<AdminRegisterProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!formData.full_name.trim()) {
      setError('Nome completo é obrigatório');
      return false;
    }
    if (!formData.password) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { confirmPassword, ...adminData } = formData;
      await registerAdmin(adminData);
      
      setSuccess('Administrador criado com sucesso!');
      setFormData({
        username: '',
        email: '',
        full_name: '',
        password: '',
        confirmPassword: ''
      });
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-overlay">
      <div className="admin-register-modal">
        <div className="admin-register-header">
          <h2>👑 Criar Novo Administrador</h2>
          {onCancel && (
            <button className="close-btn" onClick={onCancel}>
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="admin-register-form">
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite o username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite o email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Nome Completo *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Digite o nome completo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite a senha (mín. 6 caracteres)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme a senha"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            {onCancel && (
              <button type="button" className="cancel-btn" onClick={onCancel}>
                Cancelar
              </button>
            )}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Administrador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;
