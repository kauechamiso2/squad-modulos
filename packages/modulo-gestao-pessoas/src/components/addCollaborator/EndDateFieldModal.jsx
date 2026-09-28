import { useRef, useState } from 'react'
import calendarBlankIcon from '../../assets/icons/CalendarBlank.svg'
import { Checkbox, FieldModalShell } from '@squad/ui'
import { todayIso, formatDatePt } from '../../utils/formatters.js'
import './DateFieldModal.css'

function EndDateFieldModal({ value, onSave, onClose }) {
  const [noEndDate, setNoEndDate] = useState(value === null)
  const [isoDate, setIsoDate] = useState(typeof value === 'string' ? value : todayIso())
  const inputRef = useRef(null)

  return (
    <FieldModalShell
      title="Data de fim do contrato"
      onClose={onClose}
      onSave={() => onSave(noEndDate ? null : isoDate)}
    >
      <div className={noEndDate ? 'date-field date-field--disabled' : 'date-field'}>
        <span className="date-field__value">{formatDatePt(isoDate)}</span>
        <button
          type="button"
          className="date-field__calendar-button"
          disabled={noEndDate}
          onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.focus()}
        >
          <img src={calendarBlankIcon} alt="" width={24} height={24} />
        </button>
        <input
          ref={inputRef}
          type="date"
          className="date-field__native-input"
          value={isoDate}
          disabled={noEndDate}
          onChange={(event) => {
            if (event.target.value) setIsoDate(event.target.value)
          }}
        />
      </div>

      <button
        type="button"
        className="date-field__no-end-toggle"
        onClick={() => setNoEndDate((prev) => !prev)}
      >
        <Checkbox checked={noEndDate} />
        <span className="date-field__no-end-label">
          Não especificar data de fim
        </span>
      </button>
    </FieldModalShell>
  )
}

export default EndDateFieldModal
