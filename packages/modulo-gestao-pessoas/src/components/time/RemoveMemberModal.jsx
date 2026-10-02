import { ModalOverlay } from '@squad/ui'
import '@squad/ui/styles/buttons.css'
import '../addCollaborator/DiscardConfirmModal.css'

function RemoveMemberModal({ name, onCancel, onConfirm }) {
  return (
    <ModalOverlay width={360} className="discard-confirm-modal">
      <h2 className="discard-confirm-modal__title">Tem certeza?</h2>
      <p className="discard-confirm-modal__message">
        Tem certeza que deseja remover {name} do time?
      </p>
      <div className="discard-confirm-modal__footer">
        <button type="button" className="text-button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" className="pill-button" onClick={onConfirm}>
          Remover
        </button>
      </div>
    </ModalOverlay>
  )
}

export default RemoveMemberModal
