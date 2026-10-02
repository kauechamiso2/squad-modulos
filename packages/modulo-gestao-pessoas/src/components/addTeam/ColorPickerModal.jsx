import closeIcon from '../../assets/icons/Close.svg'
import { IconButton, ModalOverlay } from '@squad/ui'
import { getAvailableColorOptions } from '../../utils/teamOptions.js'
import '@squad/ui/styles/FieldModalShell.css'
import './ColorPickerModal.css'

function ColorPickerModal({ onSelect, onClose, usedColorIds = [] }) {
  const availableColors = getAvailableColorOptions(usedColorIds)

  return (
    <ModalOverlay width={360} className="field-modal">
      <div className="field-modal__header">
        <h2 className="field-modal__title">Cor do time</h2>
        <IconButton icon={closeIcon} alt="Fechar" onClick={onClose} />
      </div>

      <div className="field-modal__body">
        <div className="color-picker__grid">
          {availableColors.map((entry) => (
            <button
              type="button"
              key={entry.id}
              className="color-picker__swatch"
              style={{ background: entry.dark }}
              onClick={() => onSelect(entry.id)}
              aria-label={entry.id}
            />
          ))}
        </div>
      </div>
    </ModalOverlay>
  )
}

export default ColorPickerModal
