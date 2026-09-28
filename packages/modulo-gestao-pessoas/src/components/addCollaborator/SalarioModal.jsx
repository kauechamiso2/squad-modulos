import { useState } from 'react'
import { FieldModalShell } from '@squad/ui'
import { amountToDigits, centsToAmount, formatAmountFromDigits } from '../../utils/formatters.js'
import '@squad/ui/styles/LargeFieldInput.css'

function SalarioModal({ title = 'Salário', value, onSave, onClose }) {
  const [digits, setDigits] = useState(() => amountToDigits(value))

  return (
    <FieldModalShell
      title={title}
      onClose={onClose}
      onSave={() => onSave(centsToAmount(digits))}
      saveDisabled={!digits}
    >
      <input
        type="text"
        inputMode="numeric"
        className="large-field-input"
        placeholder="0,00"
        value={digits ? formatAmountFromDigits(digits) : ''}
        onChange={(event) => setDigits(event.target.value.replace(/\D/g, ''))}
      />
    </FieldModalShell>
  )
}

export default SalarioModal
