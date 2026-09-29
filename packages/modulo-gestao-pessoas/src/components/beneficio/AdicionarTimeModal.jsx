import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import radioButtonIcon from '../../assets/icons/RadioButton.svg'
import circleIcon from '../../assets/icons/Circle.svg'
import { formatAmountFromDigits, centsToAmount } from '../../utils/formatters.js'
import '@squad/ui/styles/SelectListModal.css'
import './AddSourceModal.css'
import { FieldModalShell } from '@squad/ui'

function AdicionarTimeModal({ times, excludedNames, onSave, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedName, setSelectedName] = useState(null)
  const [digits, setDigits] = useState('')

  const excludedSet = new Set(excludedNames)
  const trimmedQuery = query.trim().toLowerCase()
  const available = times.filter((team) => !excludedSet.has(team.name))
  const filtered = trimmedQuery
    ? available.filter((team) => team.name.toLowerCase().includes(trimmedQuery))
    : available

  const canSave = Boolean(selectedName) && digits.length > 0

  return (
    <FieldModalShell
      title="Adicionar time"
      onClose={onClose}
      saveDisabled={!canSave}
      onSave={() => onSave(selectedName, centsToAmount(digits))}
    >
      {available.length === 0 ? (
        <p className="select-list__empty">Nenhum time disponível.</p>
      ) : (
        <>
          <div className="select-list__search">
            <input
              type="text"
              autoFocus
              className="select-list__search-input"
              placeholder="Buscar time..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <img src={magnifyingGlassIcon} alt="" width={24} height={24} />
          </div>

          <div className="select-list__list">
            {filtered.map((team) => {
              const isSelected = selectedName === team.name
              return (
                <button
                  type="button"
                  key={team.id}
                  className="select-list__item"
                  onClick={() => setSelectedName(isSelected ? null : team.name)}
                >
                  <img
                    src={isSelected ? radioButtonIcon : circleIcon}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className="select-list__item-label">{team.name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      <p className="add-source-modal__section-label">Valor por pessoa</p>
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

export default AdicionarTimeModal
