import { useEffect, useRef, useState } from 'react'
import plusIcon from '../../assets/icons/Plus.svg'
import closeIcon from '../../assets/icons/Close.svg'
import { useDropdownPosition } from '../../utils/useDropdownPosition.js'
import { addItem, COLLECTIONS } from '../../utils/storage.js'
import '@squad/ui/styles/SelectListModal.css'
import './InlineEditField.css'
import './ColaboradorDetail.css'

function CargoField({ value, cargos, disabled, onSave }) {
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
    ? cargos.filter((cargo) => cargo.name.toLowerCase().includes(trimmedQuery.toLowerCase()))
    : cargos
  const exactMatch = cargos.some(
    (cargo) => cargo.name.toLowerCase() === trimmedQuery.toLowerCase(),
  )
  const showCreate = trimmedQuery.length > 0 && !exactMatch

  const select = (name) => {
    onSave([name])
    setEditing(false)
    setQuery('')
  }

  const handleCreate = () => {
    const newCargo = addItem(COLLECTIONS.CARGOS, { name: trimmedQuery, pending: true })
    select(newCargo.name)
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
            if (event.key === 'Escape') cancelEdit()
          }}
        />
        <button
          type="button"
          className="inline-edit-field__cancel"
          onMouseDown={(event) => event.preventDefault()}
          onClick={cancelEdit}
        >
          <img src={closeIcon} alt="Cancelar" width={16} height={16} />
        </button>
      </div>

      {rect && (
        <div
          className="colaborador-field__dropdown"
          style={{ top: rect.top, left: rect.left }}
        >
          <div className="select-list__list">
            {filtered.map((cargo) => (
              <button
                type="button"
                key={cargo.id}
                className="select-list__item"
                onClick={() => select(cargo.name)}
              >
                <span className="select-list__item-label">{cargo.name}</span>
              </button>
            ))}

            {showCreate && (
              <button type="button" className="select-list__create" onClick={handleCreate}>
                <span className="select-list__create-label">
                  Criar cargo: &quot;{trimmedQuery}&quot;
                </span>
                <img src={plusIcon} alt="" width={24} height={24} />
              </button>
            )}

            {!showCreate && filtered.length === 0 && (
              <p className="select-list__empty">Nenhum cargo encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CargoField
