import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import radioButtonIcon from '../../assets/icons/RadioButton.svg'
import circleIcon from '../../assets/icons/Circle.svg'
import { formatAmountFromDigits, centsToAmount } from '../../utils/formatters.js'
import '@squad/ui/styles/SelectListModal.css'
import './AddSourceModal.css'
import { FieldModalShell } from '@squad/ui'

function AdicionarMembroModal({ collaborators, excludedIds, onSave, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [digits, setDigits] = useState('')

  const excludedSet = new Set(excludedIds)
  const trimmedQuery = query.trim().toLowerCase()
  const available = collaborators.filter((collaborator) => !excludedSet.has(collaborator.id))
  const filtered = trimmedQuery
    ? available.filter((collaborator) => collaborator.name.toLowerCase().includes(trimmedQuery))
    : available

  const canSave = Boolean(selectedId) && digits.length > 0

  return (
    <FieldModalShell
      title="Adicionar membro"
      onClose={onClose}
      saveDisabled={!canSave}
      onSave={() => onSave(selectedId, centsToAmount(digits))}
    >
      {available.length === 0 ? (
        <p className="select-list__empty">Nenhum colaborador disponível.</p>
      ) : (
        <>
          <div className="select-list__search">
            <input
              type="text"
              autoFocus
              className="select-list__search-input"
              placeholder="Buscar colaborador..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <img src={magnifyingGlassIcon} alt="" width={24} height={24} />
          </div>

          <div className="select-list__list">
            {filtered.map((collaborator) => {
              const isSelected = selectedId === collaborator.id
              return (
                <button
                  type="button"
                  key={collaborator.id}
                  className="select-list__item"
                  onClick={() => setSelectedId(isSelected ? null : collaborator.id)}
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

      <p className="add-source-modal__section-label">Valor</p>
      <div className="add-source-modal__value-input-wrap">
        <span className="add-source-modal__value-currency-prefix">R$</span>
        <input
          type="text"
          inputMode="numeric"
          className="add-source-modal__value-input"
          placeholder="0,00"
          value={digits ? formatAmountFromDigits(digits) : ''}
          onChange={(event) => setDigits(event.target.value.replace(/\D/g, ''))}
        />
      </div>
    </FieldModalShell>
  )
}

export default AdicionarMembroModal
