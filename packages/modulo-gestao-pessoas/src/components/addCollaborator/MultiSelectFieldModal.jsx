import { useState } from 'react'
import magnifyingGlassIcon from '../../assets/icons/MagnifyingGlass.svg'
import plusIcon from '../../assets/icons/Plus.svg'
import { Checkbox, FieldModalShell } from '@squad/ui'
import { getCollection, addItem } from '../../utils/storage.js'
import '@squad/ui/styles/SelectListModal.css'

function MultiSelectFieldModal({
  title,
  collectionName,
  createLabelPrefix,
  value,
  onSave,
  onClose,
}) {
  const [items] = useState(() => getCollection(collectionName))
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set(value))

  const trimmedQuery = query.trim()
  const filtered = trimmedQuery
    ? items.filter((item) =>
        item.name.toLowerCase().includes(trimmedQuery.toLowerCase()),
      )
    : []

  const exactMatch = items.some(
    (item) => item.name.toLowerCase() === trimmedQuery.toLowerCase(),
  )
  const showCreate = trimmedQuery.length > 0 && !exactMatch

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

  const handleCreate = () => {
    const newItem = addItem(collectionName, { name: trimmedQuery, pending: true })
    const nextSelected = new Set(selected).add(newItem.name)
    onSave(Array.from(nextSelected))
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
        {filtered.map((item) => {
          const checked = selected.has(item.name)
          return (
            <button
              type="button"
              key={item.id}
              className="select-list__item"
              onClick={() => toggle(item.name)}
            >
              <Checkbox checked={checked} />
              <span className="select-list__item-label">{item.name}</span>
            </button>
          )
        })}

        {showCreate && (
          <button
            type="button"
            className="select-list__create"
            onClick={handleCreate}
          >
            <span className="select-list__create-label">
              {createLabelPrefix}: &quot;{trimmedQuery}&quot;
            </span>
            <img src={plusIcon} alt="" width={24} height={24} />
          </button>
        )}
      </div>
    </FieldModalShell>
  )
}

export default MultiSelectFieldModal
