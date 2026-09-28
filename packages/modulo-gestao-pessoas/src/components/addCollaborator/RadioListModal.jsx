import { useState } from 'react'
import closeIcon from '../../assets/icons/Close.svg'
import radioButtonIcon from '../../assets/icons/RadioButton.svg'
import circleIcon from '../../assets/icons/Circle.svg'
import { IconButton, ModalOverlay } from '@squad/ui'
import '@squad/ui/styles/buttons.css'
import './RadioListModal.css'

function RadioListModal({ title, options, value, onSave, onClose }) {
  const [selected, setSelected] = useState(value)

  return (
    <ModalOverlay width={532} className="radio-list-modal">
      <div className="radio-list-modal__header">
        <h2 className="radio-list-modal__title">{title}</h2>
        <IconButton icon={closeIcon} alt="Fechar" onClick={onClose} />
      </div>

      <div className="radio-list-modal__options">
        {options.map((option) => {
          const isSelected = option === selected
          return (
            <button
              type="button"
              key={option}
              className="radio-list-modal__option"
              onClick={() => setSelected(option)}
            >
              <img
                src={isSelected ? radioButtonIcon : circleIcon}
                alt=""
                width={24}
                height={24}
              />
              <span className="radio-list-modal__option-label">{option}</span>
            </button>
          )
        })}
      </div>

      <div className="radio-list-modal__footer">
        <button type="button" className="text-button" onClick={onClose}>
          Voltar
        </button>
        <button
          type="button"
          className="pill-button"
          onClick={() => onSave(selected)}
        >
          Salvar
        </button>
      </div>
    </ModalOverlay>
  )
}

export default RadioListModal
