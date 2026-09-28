import { useState } from 'react'
import { FieldModalShell } from '@squad/ui'
import { isValidEmail } from '../../utils/formatters.js'
import '@squad/ui/styles/LargeFieldInput.css'

function EmailModal({ value, onSave, onClose }) {
  const [email, setEmail] = useState(value ?? '')

  return (
    <FieldModalShell
      title="Email"
      onClose={onClose}
      onSave={() => onSave(email)}
      saveDisabled={!isValidEmail(email)}
    >
      <input
        type="text"
        className="large-field-input"
        placeholder="nome@email.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
    </FieldModalShell>
  )
}

export default EmailModal
