import { useEffect, useRef, useState } from 'react'
import xIcon from '../../assets/icons/X.svg'
import { useDropdownPosition } from '../../utils/useDropdownPosition.js'
import '@squad/ui/styles/SelectListModal.css'
import './InlineEditField.css'
import './ColaboradorDetail.css'

// Plain autocomplete, no quick-create: cargo suggestions come from the
// distinct Cargo values already assigned to other colaboradores, and the
// typed text itself - matching a suggestion or not - becomes the value
// directly. There's no separate cargo record to create anywhere.
function CargoField({ value, cargoOptions, disabled, onSave }) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const anchorRef = useRef(null)
  const rect = useDropdownPosition(editing, anchorRef)

  useEffect(() => {
    if (!editing) return
    function handleClickOutside(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setEditing(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editing])

  const displayValue = value.length ? value.join(', ') : 'Adicionar'
  const trimmedQuery = query.trim()
  const filtered = trimmedQuery
    ? cargoOptions.filter((name) => name.toLowerCase().includes(trimmedQuery.toLowerCase()))
    : cargoOptions

  const select = (name) => {
    onSave([name])
    setEditing(false)
    setQuery('')
  }

  const confirmTyped = () => {
    if (!trimmedQuery) return
    select(trimmedQuery)
  }

  const startEdit = () => {
    if (disabled) return
    setQuery('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setQuery('')
  }

  if (!editing) {
    return (
      <button
        type="button"
        className="colaborador-detail__value-button"
        onClick={startEdit}
        disabled={disabled}
      >
        {displayValue}
      </button>
    )
  }

  return (
    <div className="colaborador-field colaborador-field--fill" ref={anchorRef}>
      <div className="inline-edit-field">
        <input
          type="text"
          autoFocus
          className="inline-edit-field__input"
          placeholder="Buscar cargo..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') confirmTyped()
            if (event.key === 'Escape') cancelEdit()
          }}
        />
        <button
          type="button"
          className="inline-edit-field__cancel"
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancelEdit}
        >
          <img src={xIcon} alt="Cancelar" width={24} height={24} />
        </button>
      </div>

      {rect && (
        <div
          className="colaborador-field__dropdown"
          style={{ top: rect.top, left: rect.left }}
        >
          <div className="select-list__list">
            {filtered.map((name) => (
              <button
                type="button"
                key={name}
                className="select-list__item"
                onClick={() => select(name)}
              >
                <span className="select-list__item-label">{name}</span>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="select-list__empty">Nenhum cargo encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CargoField
