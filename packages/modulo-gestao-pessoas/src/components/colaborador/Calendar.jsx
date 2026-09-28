import { useState } from 'react'
import caretLeftIcon from '../../assets/icons/CaretLeft.svg'
import caretRightIcon from '../../assets/icons/CaretRight.svg'
import './Calendar.css'

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function toIso(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function parseIso(value) {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month: month - 1, day }
}

function Calendar({ value, onSelect }) {
  const initial = value ? parseIso(value) : parseIso(toIso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))
  const [viewYear, setViewYear] = useState(initial.year)
  const [viewMonth, setViewMonth] = useState(initial.month)

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((year) => year - 1)
    } else {
      setViewMonth((month) => month - 1)
    }
  }

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((year) => year + 1)
    } else {
      setViewMonth((month) => month + 1)
    }
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button type="button" className="calendar__nav-button" onClick={goPrevMonth}>
          <img src={caretLeftIcon} width={16} height={16} alt="Mês anterior" />
        </button>
        <span className="calendar__title">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </span>
        <button type="button" className="calendar__nav-button" onClick={goNextMonth}>
          <img src={caretRightIcon} width={16} height={16} alt="Próximo mês" />
        </button>
      </div>

      <div className="calendar__weekdays">
        {WEEKDAY_LABELS.map((label, index) => (
          <span className="calendar__weekday" key={index}>
            {label}
          </span>
        ))}
      </div>

      <div className="calendar__grid">
        {cells.map((day, index) => {
          if (day === null) {
            return <span className="calendar__cell calendar__cell--empty" key={index} />
          }
          const iso = toIso(viewYear, viewMonth, day)
          const selected = iso === value
          return (
            <button
              type="button"
              key={index}
              className={
                selected ? 'calendar__cell calendar__cell--selected' : 'calendar__cell'
              }
              onClick={() => onSelect(iso)}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
