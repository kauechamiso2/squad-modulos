import { useEffect, useRef, useState } from 'react'
import { Square } from '@phosphor-icons/react'
import closeIcon from '../../assets/icons/Close.svg'
import checkSquareIcon from '../../assets/icons/CheckSquare.svg'
import Calendar from './Calendar.jsx'
import { useDropdownPosition } from '../../utils/useDropdownPosition.js'
import './InlineEditField.css'
import './ColaboradorDetail.css'

function DateField({ value, allowNoEnd, disabled, displayValue, onSave }) {
  const [open, setOpen] = useState(false)
  const [noEndDate, setNoEndDate] = useState(Boolean(allowNoEnd) && value === null)
  const anchorRef = useRef(null)
  const rect = useDropdownPosition(open, anchorRef)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const startEdit = () => {
    if (disabled) return
    setNoEndDate(Boolean(allowNoEnd) && value === null)
    setOpen(true)
  }

  const cancelEdit = () => setOpen(false)

  const selectDate = (date) => {
    setNoEndDate(false)
    onSave(date)
    setOpen(false)
  }

  const toggleNoEnd = () => {
    const next = !noEndDate
    setNoEndDate(next)
    if (next) {
      onSave(null)
      setOpen(false)
    }
  }

  return (
    <div className="colaborador-field colaborador-field--fill" ref={anchorRef}>
      {open ? (
        <div className="inline-edit-field">
          <span className="inline-edit-field__input inline-edit-field__input--readonly">
            {displayValue}
          </span>
          <button
            type="button"
            className="inline-edit-field__cancel"
            onMouseDown={(event) => event.preventDefault()}
            onClick={cancelEdit}
          >
            <img src={closeIcon} alt="Cancelar" width={16} height={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="colaborador-detail__value-button"
          onClick={startEdit}
          disabled={disabled}
        >
          {displayValue}
        </button>
      )}

      {open && rect && (
        <div
          className="colaborador-field__dropdown colaborador-date-field__dropdown"
          style={{ top: rect.top, left: rect.left }}
        >
          {!noEndDate && (
            <Calendar value={typeof value === 'string' ? value : null} onSelect={selectDate} />
          )}

          {allowNoEnd && (
            <button
              type="button"
              className="colaborador-date-field__no-end-toggle"
              onClick={toggleNoEnd}
            >
              {noEndDate ? (
                <img src={checkSquareIcon} alt="" width={24} height={24} />
              ) : (
                <Square size={24} color="#000000" />
              )}
              <span className="colaborador-date-field__no-end-label">
                Não especificar data de fim
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default DateField
