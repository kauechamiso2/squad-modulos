import closeIcon from '../assets/icons/Close.svg'
import IconButton from './IconButton.jsx'
import ModalOverlay from './ModalOverlay.jsx'
import '../styles/buttons.css'
import '../styles/FieldModalShell.css'

function FieldModalShell({ title, onClose, onSave, saveDisabled = false, children }) {
  return (
    <ModalOverlay width={532} className="field-modal">
      <div className="field-modal__header">
        <h2 className="field-modal__title">{title}</h2>
        <IconButton icon={closeIcon} alt="Fechar" onClick={onClose} />
      </div>

      <div className="field-modal__body">{children}</div>

      <div className="field-modal__footer">
        <button type="button" className="text-button" onClick={onClose}>
          Voltar
        </button>
        <button
          type="button"
          className="pill-button"
          disabled={saveDisabled}
          onClick={onSave}
        >
          Salvar
        </button>
      </div>
    </ModalOverlay>
  )
}

export default FieldModalShell
