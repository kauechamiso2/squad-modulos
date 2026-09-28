import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import radioButtonIcon from '../../assets/icons/RadioButton.svg'
import circleIcon from '../../assets/icons/Circle.svg'
import { FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/SelectListModal.css'

function LiderModal({ value, collaborators, onSave, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(value ?? null)

  const trimmedQuery = query.trim().toLowerCase()
  const filteredCollaborators = trimmedQuery
    ? collaborators.filter((collaborator) =>
        collaborator.name.toLowerCase().includes(trimmedQuery),
      )
    : collaborators

  return (
    <FieldModalShell
      title="Líder do time"
      onClose={onClose}
      onSave={() => onSave(selected)}
    >
      {collaborators.length === 0 ? (
        <p className="select-list__empty">Nenhum colaborador cadastrado.</p>
      ) : (
        <>
          <div className="select-list__search">
            <input
              type="text"
              autoFocus
              className="select-list__search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <img src={magnifyingGlassIcon} alt="" width={24} height={24} />
          </div>

          <div className="select-list__list">
            {filteredCollaborators.map((collaborator) => {
              const isSelected = selected === collaborator.id
              return (
                <button
                  type="button"
                  key={collaborator.id}
                  className="select-list__item"
                  onClick={() => setSelected(isSelected ? null : collaborator.id)}
                >
                  <img
                    src={isSelected ? radioButtonIcon : circleIcon}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className="select-list__item-label">{collaborator.name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </FieldModalShell>
  )
}

export default LiderModal
