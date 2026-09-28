import { useState } from 'react'
import { Checkbox, FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/SelectListModal.css'

function AddEmTimeModal({ teams, onSave, onClose }) {
  const [selected, setSelected] = useState(() => new Set())

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
      title="Add em time"
      onClose={onClose}
      onSave={() => onSave(Array.from(selected))}
    >
      <div className="select-list__list">
        {teams.map((team) => {
          const checked = selected.has(team.name)
          return (
            <button
              type="button"
              key={team.id}
              className="select-list__item"
              onClick={() => toggle(team.name)}
            >
              <Checkbox checked={checked} />
              <span className="select-list__item-label">{team.name}</span>
            </button>
          )
        })}
      </div>
    </FieldModalShell>
  )
}

export default AddEmTimeModal
