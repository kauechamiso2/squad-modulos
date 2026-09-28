import { useState } from 'react'
import { FieldModalShell } from '@squad/ui'
import '@squad/ui/styles/LargeFieldInput.css'

function ContatoFornecedorModal({ value, onSave, onClose }) {
  const [contato, setContato] = useState(value ?? '')

  return (
    <FieldModalShell
      title="Contato do fornecedor"
      onClose={onClose}
      onSave={() => onSave(contato)}
    >
      <input
        type="text"
        autoFocus
        className="large-field-input"
        placeholder="(00) 00000-0000"
        value={contato}
        onChange={(event) => setContato(event.target.value)}
      />
    </FieldModalShell>
  )
}

export default ContatoFornecedorModal
