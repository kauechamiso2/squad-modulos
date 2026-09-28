import { useState } from 'react'
import { FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/LargeFieldInput.css'

function LinkModal({ value, onSave, onClose }) {
  const [link, setLink] = useState(value ?? '')

  return (
    <FieldModalShell title="Link do benefício" onClose={onClose} onSave={() => onSave(link)}>
      <input
        type="text"
        autoFocus
        className="large-field-input"
        placeholder="https://"
        value={link}
        onChange={(event) => setLink(event.target.value)}
      />
    </FieldModalShell>
  )
}

export default LinkModal
