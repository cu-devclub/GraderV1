import React from 'react';

const CustomModal = ({ show, title, message, type, inputPlaceholder, inputValue, onInputChange, onClose, onConfirm, confirmText, confirmColor }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }}>
          <div className="modal-content" style={{ borderRadius: '24px', padding: '32px 24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
            
            <div className="modal-body text-center" style={{ padding: '0' }}>
              {title && <h4 style={{ fontWeight: '700', color: '#334155', marginBottom: '16px' }}>{title}</h4>}
              {message && <p style={{ color: '#475569', fontSize: '1.05rem', marginBottom: '28px', lineHeight: '1.5' }}>{message}</p>}
              
              {type === 'prompt' && (
                <div style={{ marginBottom: '28px' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={inputPlaceholder} 
                    value={inputValue} 
                    onChange={(e) => onInputChange(e.target.value)}
                    style={{ borderRadius: '12px', padding: '12px 16px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '1rem', color: '#334155', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}
                    autoFocus
                  />
                </div>
              )}
            </div>

            <div className="d-flex justify-content-center gap-3">
              <button 
                type="button" 
                onClick={onClose}
                style={{ 
                  borderRadius: '24px', padding: '10px 28px', border: 'none', 
                  backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: '600',
                  fontSize: '1rem', transition: 'background-color 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => onConfirm(inputValue)}
                style={{ 
                  borderRadius: '24px', padding: '10px 28px', border: 'none', 
                  backgroundColor: confirmColor === 'danger' ? '#ef4444' : '#de4b87', 
                  color: 'white', fontWeight: '600',
                  fontSize: '1rem', transition: 'background-color 0.2s, transform 0.1s',
                  boxShadow: confirmColor === 'danger' ? '0 4px 12px rgba(239,68,68,0.3)' : '0 4px 12px rgba(222,75,135,0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = confirmColor === 'danger' ? '#dc2626' : '#c93976';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = confirmColor === 'danger' ? '#ef4444' : '#de4b87';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {confirmText || 'Confirm'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CustomModal;
