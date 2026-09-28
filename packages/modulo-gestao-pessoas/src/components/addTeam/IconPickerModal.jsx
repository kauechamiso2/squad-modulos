import { useState } from 'react'
import closeIcon from '../../assets/icons/Close.svg'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import { IconButton, ModalOverlay } from '@squad/ui'
import { TEAM_ICON_CATEGORIES } from '../../utils/teamOptions.js'
import '@squad/ui/styles/FieldModalShell.css'
import '@squad/ui/styles/SelectListModal.css'
import './IconPickerModal.css'

function IconPickerModal({ value, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const trimmedQuery = query.trim().toLowerCase()

  const filteredCategories = TEAM_ICON_CATEGORIES.map((category) => ({
    ...category,
    icons: trimmedQuery
      ? category.icons.filter((icon) => icon.name.toLowerCase().includes(trimmedQuery))
      : category.icons,
  })).filter((category) => category.icons.length > 0)

  return (
    <ModalOverlay width={480} className="field-modal icon-picker">
      <div className="field-modal__header">
        <h2 className="field-modal__title">Icone do time</h2>
        <IconButton icon={closeIcon} alt="Fechar" onClick={onClose} />
      </div>

      <div className="field-modal__body">
        <div className="select-list__search">
          <input
            type="text"
            autoFocus
            className="select-list__search-input"
            placeholder="Buscar icone..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <img src={magnifyingGlassIcon} alt="" width={24} height={24} />
        </div>

        <div className="icon-picker__categories">
          {filteredCategories.length === 0 && (
            <p className="select-list__empty">Nenhum icone encontrado.</p>
          )}
          {filteredCategories.map((category) => (
            <div className="icon-picker__category" key={category.id}>
              <p className="icon-picker__category-label">{category.label}</p>
              <div className="icon-picker__grid">
                {category.icons.map(({ name, Icon }) => (
                  <button
                    type="button"
                    key={name}
                    className={
                      name === value
                        ? 'icon-picker__option icon-picker__option--selected'
                        : 'icon-picker__option'
                    }
                    onClick={() => onSelect(name)}
                    aria-label={name}
                  >
                    <Icon size={24} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalOverlay>
  )
}

export default IconPickerModal
