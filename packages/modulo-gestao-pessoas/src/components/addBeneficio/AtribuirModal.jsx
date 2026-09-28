import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import { Checkbox, FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/SelectListModal.css'

function AtribuirModal({ people, value, assignedElsewhere, onSave, onClose }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set(value))

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = trimmedQuery
    ? people.filter((person) => person.name.toLowerCase().includes(trimmedQuery))
    : people

  // Already-assigned-elsewhere people always sort to the bottom, after every
  // currently-assignable person, regardless of search/filter state.
  const sortedPeople = [...filtered].sort((a, b) => {
    const aAssigned = assignedElsewhere.has(a.id)
    const bAssigned = assignedElsewhere.has(b.id)
    if (aAssigned === bAssigned) return 0
    return aAssigned ? 1 : -1
  })

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
      title="Atribuir"
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
        {sortedPeople.map((person) => {
          const elsewhereValue = assignedElsewhere.get(person.id)
          if (elsewhereValue) {
            return (
              <div className="select-list__item--disabled" key={person.id}>
                <Checkbox checked={false} />
                <span className="select-list__item-label">{person.name}</span>
                <span className="select-list__item-hint">Já atribuído a {elsewhereValue}</span>
              </div>
            )
          }

          const checked = selected.has(person.id)
          return (
            <button
              type="button"
              key={person.id}
              className="select-list__item"
              onClick={() => toggle(person.id)}
            >
              <Checkbox checked={checked} />
              <span className="select-list__item-label">{person.name}</span>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <p className="select-list__empty">Ninguém para atribuir ainda.</p>
        )}
      </div>
    </FieldModalShell>
  )
}

export default AtribuirModal
