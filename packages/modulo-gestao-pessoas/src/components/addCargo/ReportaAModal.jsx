import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import { Checkbox, FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/SelectListModal.css'

function ReportaAModal({ collaborators, excludedNames, value, onSave, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set(value))

  const excludedSet = new Set(excludedNames)
  const selectable = collaborators.filter((collaborator) => !excludedSet.has(collaborator.name))

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = trimmedQuery
    ? selectable.filter((collaborator) =>
        collaborator.name.toLowerCase().includes(trimmedQuery),
      )
    : selectable

  const toggle = (name) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  return (
    <FieldModalShell
      title="Reporta a"
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
          const checked = selected.has(collaborator.name)
          return (
            <button
              type="button"
              key={collaborator.id}
              className="select-list__item"
              onClick={() => toggle(collaborator.name)}
            >
              <Checkbox checked={checked} />
              <span className="select-list__item-label">{collaborator.name}</span>
            </button>
          )
        })}
      </div>
    </FieldModalShell>
  )
}

export default ReportaAModal
