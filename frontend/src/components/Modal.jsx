import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const Modal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className={`modal-icon-wrapper ${type}`}>
            {type === 'danger' ? <AlertTriangle size={24} /> : null}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className={`btn-${type === 'danger' ? 'danger-solid' : 'primary'}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
