import closeIcon from '../assets/icons/Close.svg'
import '@squad/ui/styles/buttons.css'
import './ConfirmModal.css'
import { IconButton } from '@squad/ui'

// Shared confirmation-modal shell for every "are you sure?" prompt in the
// app - Excluir (Trash), Desligar (Power), and Descartar edições
// (XCircle) all render through this, differing only in icon/copy/confirm
// label. Deliberately not dismissible by clicking the overlay - only the
// floating X or the two footer buttons close it, matching every other
// confirm modal already in the app.
function ConfirmModal({ icon: Icon, title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-stack">
        <IconButton
          icon={closeIcon}
          alt="Fechar"
          onClick={onCancel}
          className="confirm-modal__close-button"
        />
        <div className="confirm-modal">
          <span className="confirm-modal__badge">
            <Icon size={24} color="#5d4309" />
          </span>
          <h2 className="confirm-modal__title">{title}</h2>
          <p className="confirm-modal__message">{message}</p>
          <div className="confirm-modal__footer">
            <button type="button" className="confirm-modal__cancel-button" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="pill-button" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
