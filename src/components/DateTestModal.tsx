import React from 'react'
import { formatDateTime, formatDateOnly } from '../utils/dateUtils'

interface DateTestModalProps {
  isOpen: boolean
  onClose: () => void
  ticketData?: {
    created_at: string
    updated_at: string
  }
}

const DateTestModal: React.FC<DateTestModalProps> = ({ isOpen, onClose, ticketData }) => {
  if (!isOpen) return null

  const testDates = [
    new Date().toISOString(), // Data atual
    '2025-01-15T10:30:00Z', // Data de exemplo
    '2025-01-15T10:30:00-03:00', // Data com fuso horário brasileiro
    ticketData?.created_at || '',
    ticketData?.updated_at || ''
  ].filter(Boolean)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>🧪 Teste de Formatação de Datas</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4>📅 Datas de Teste:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data Original</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data + Hora</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Apenas Data</th>
              </tr>
            </thead>
            <tbody>
              {testDates.map((date, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontFamily: 'monospace' }}>
                    {date}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {formatDateTime(date)}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {formatDateOnly(date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
          <h4>ℹ️ Informações:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>Data atual:</strong> {new Date().toLocaleString('pt-BR')}</li>
            <li><strong>Data atual UTC:</strong> {new Date().toISOString()}</li>
            <li><strong>Fuso horário:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</li>
            <li><strong>Formato esperado:</strong> DD/MM/AAAA, HH:MM</li>
            <li><strong>Fuso horário brasileiro:</strong> UTC-3</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DateTestModal
