import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import { Checkbox, FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/SelectListModal.css'
import checkSquareIcon from '../../assets/icons/CheckSquare.svg'

function MembrosModal({ title = 'Adicionar membros', collaborators, value, onSave, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set(value))

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = trimmedQuery
    ? collaborators.filter((collaborator) =>
        collaborator.name.toLowerCase().includes(trimmedQuery),
      )
    : collaborators

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <FieldModalShell
      title={title}
      onClose={onClose}
      onSave={() => onSave(Array.from(selected))}
    >
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
        {filtered.map((collaborator) => {
          const checked = selected.has(collaborator.id)
          return (
            <button
              type="button"
              key={collaborator.id}
              className="select-list__item"
              onClick={() => toggle(collaborator.id)}
            >
              <Checkbox checked={checked} iconeMarcado={checkSquareIcon} />
              <span className="select-list__item-label">{collaborator.name}</span>
            </button>
          )
        })}
      </div>
    </FieldModalShell>
  )
}

export default MembrosModal
