import ModalOverlay from './ModalOverlay.jsx'
import '../styles/buttons.css'
import '../styles/DiscardConfirmModal.css'

function DiscardConfirmModal({ onCancel, onConfirm }) {
  return (
    <ModalOverlay width={360} className="discard-confirm-modal">
      <h2 className="discard-confirm-modal__title">Tem certeza?</h2>
      <p className="discard-confirm-modal__message">
        Ao voltar, todo o progresso será perdido. Nenhuma informação foi
        salva.
      </p>
      <div className="discard-confirm-modal__footer">
        <button type="button" className="text-button" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="pill-button"
          onClick={onConfirm}
        >
          Descartar
        </button>
      </div>
    </ModalOverlay>
  )
}

export default DiscardConfirmModal
