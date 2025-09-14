// src/components/common/DeleteConfirmation.jsx
import { X } from 'lucide-react'
import './DeleteConfirmation.css'

const DeleteConfirmation = ({ item, onClose, onConfirm, title, message }) => {
  return (
    <div className="delete-overlay">
      <div className="delete-modal">
        <div className="delete-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="delete-content">
          <p>{message}</p>
        </div>
        
        <div className="delete-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmation